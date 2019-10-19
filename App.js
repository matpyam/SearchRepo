import React from 'react';
import { StyleSheet, SafeAreaView, View,FlatList,TextInput,Text,ActivityIndicator,RefreshControl  } from 'react-native';
import FontAwesome,{ SolidIcons, RegularIcons, BrandIcons } from 'react-native-fontawesome';

 
function Item({ title }) {
  return (
    <View>
      <Text style={{width: '100%',backgroundColor: '#C9FCE7',fontWeight: 'bold'}}>{title.fullname}</Text>
      <Text style={{width: '100%',backgroundColor: '#C9FCE7'}}>{title.desc}</Text>
      <Text style={{width: '100%',backgroundColor: '#C9FCE7'}}>{title.updated}</Text>
      <Text style={{width: '100%',backgroundColor: '#C9FCE7'}}>{title.language}</Text>
      <View style={{width: '100%',backgroundColor: '#C9FCE7'}}>
        <FontAwesome style={{width: '50%',fontSize: 32}} icon={SolidIcons.star} />
        <Text style={{width: '50%',backgroundColor: '#C9FCE7'}}> {title.stars}</Text>
      </View>
    </View>
  );
}

var currentPage = 0;

export default class App extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      TextInputValue: '',
      loading: false, 
      isRefreshing: false, 
      itemperpage : 10,
      GitHubArray : []
    }
    //this.GitHubArray = [];
  }

  getSearchKeyword(itemperpage) {
    //this.state.GitHubArray = [];
    const { TextInputValue }  = this.state ;
    this.setState({ loading: true })
    fetch("https://api.github.com/search/repositories?per_page="+itemperpage+"&q="+TextInputValue)
    .then(response => response.json())
    .then((responseJson)=> {
      this.setState({
        loading: false,
        isRefreshing: false,
        dataSource: responseJson,
      })
      this.dataPlacement(this.state.dataSource);
    })
    .catch(error=>
      this.setState({ loading: false, error: 'Something just went wrong' })
    ) 
  }
  
  handleLoadMore () {
    //this.state.GitHubArray = [];
    if (!this.state.loading) {
      this.state.itemperpage = this.state.itemperpage + 10; 
      this.getSearchKeyword(this.state.itemperpage);
    }
  };

  onRefresh() {
    this.setState({ isRefreshing: true,itemperpage:10 });
    this.getSearchKeyword(this.state.itemperpage);
    this.state.GitHubArray = [];
  }

  convertISODate (ISODateTime) {
    var today = new Date(ISODateTime );
    today =  new Date(today.getTime() + ( today.getTimezoneOffset() * 60000 ));

    const monthNames = ["Jan", "Feb", "Mac", "Apr", "May", "June",
      "July", "Aug", "Sept", "Oct", "Nov", "Dec"
    ];
    const dayName = ["Sun", "Mon", "Tues", "Wed", "Thur", "Fri",
      "Sat"
    ];


    var year = today.getFullYear();
    var month = (today.getMonth() + 1).toString();
    var formatedMonth = (month.length === 1) ? ("0" + month) : month;
    var day = today.getDate().toString();
    var formatedDay = (day.length === 1) ? ("0" + day) : day;
    var hour = today.getHours().toString();
    var formatedHour = (hour.length === 1) ? ("0" + hour) : hour;
    var minute = today.getMinutes().toString();
    var formatedMinute = (minute.length === 1) ? ("0" + minute) : minute;
    var second = today.getSeconds().toString();
    var formatedSecond = (second.length === 1) ? ("0" + second) : second;
    //return 'Updated on ' + formatedDay + "-" + formatedMonth + "-" + year + " " + formatedHour + ':' + formatedMinute + ':' + formatedSecond;

    return 'Updated on ' + dayName[today.getDay()] +" "+ formatedDay +" " + monthNames[today.getMonth()] + " " + year;
  }

  dataPlacement(response) {
   
    if(response == null || response.items.length == 0) {
        alert("No data found for " + this.state.TextInputValue);
        return;
    }
    
    var items = response.items;
    var st=0;
    if (items.length == 10) {
      st = 0;
    } else {
      st = items.length - 10;
    }
    for (var i=st;i<items.length;i++) {
      const data = {};
      data["id"] = items[i].id;
      data["fullname"] = items[i].full_name;
      data["desc"] = items[i].description;
      data["language"] = items[i].language;
      data["stars"] = items[i].forks_count;
      data["updated"] = this.convertISODate(items[i].updated_at);

      this.state.GitHubArray.push(data);
    }
    console.log("DATA ::: " + JSON.stringify(this.state.GitHubArray));
  }
  renderSeparator() {
    return (
      <View
        style={{
          height: 2,
          width: "100%",
          backgroundColor: "#CED0CE",
          marginLeft: "14%"
        }}
      />
    );
  };
  renderFooter() {
     if (!this.state.loading) return null;
     return (
       <ActivityIndicator
       size="large" color="#0000ff"
       />
     );
   };

  render(){
    if (this.state.loading && this.state.itemperpage === 1) {
      return <View style={{
        position : 'absolute',
        marginTop : '50%',
        width: '100%',
        height: '100%'
      }}><ActivityIndicator  size="large" color="#0000ff" /></View>;
    }
    return (
      <View>
        <TextInput
              style={styles.textinput}
              placeholder="Enter Keyword.."
              underlineColorAndroid="transparent"
              onChangeText={TextInputValue => this.setState({TextInputValue})}
              onSubmitEditing={(text) => this.getSearchKeyword(this.state.itemperpage)}
              value
            />
        <SafeAreaView>
          <FlatList
            ItemSeparatorComponent={this.renderSeparator}
            data={this.state.GitHubArray}
            extraData={this.state}
            renderItem={({ item }) => <Item title={item} />}
            keyExtractor={item => item.id}
            onEndReached={this.handleLoadMore.bind(this)}
            onEndReachedThreshold={0.4}
            ListFooterComponent={this.renderFooter.bind(this)}
            refreshControl={
              <RefreshControl
                refreshing={this.state.isRefreshing}
                onRefresh={this.onRefresh.bind(this)}
              />
            }
          />
      </SafeAreaView>
      </View>
      
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'flex-start',
  },
  textinput : {
    width : '100%',
    backgroundColor: '#E9E9E9'
  },
  list : {
    width : '100%',
    backgroundColor: '#FFF'
  }
});
