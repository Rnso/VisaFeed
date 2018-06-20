// @flow

import React, { Component } from 'react'
import {
  Platform,
  Dimensions,
  Text,
  View,
  FlatList,
  Image,
  TouchableOpacity,
  RefreshControl,
  WebView,
  ScrollView,
  ActivityIndicator,
} from 'react-native'
import { Icon, SearchBar } from 'react-native-elements'
import SplashScreen from 'react-native-splash-screen'
import styles from './Style'
import * as temp from './url'

type data = {
  link: string,
  title: string,
  image: string,
  time: string,
}

type Props = {

}

type State = {
  news?: data[],
  refreshing: boolean,
  webview: boolean,
  loading: boolean,
  search_string: string,
  show_searchbar: boolean,
  uri?: string,
  count: number,
}
export default class App extends Component<Props, State> {
  constructor() {
    super()
    this.state = { refreshing: false, webview: false, loading: true, search_string: 'visa', show_searchbar: false, uri: '', news: [], count: 0 }
  }
  componentDidMount() {
    this.fetchData()
    SplashScreen.hide()
  }
  fetchData() {
     fetch(`https://www.googleapis.com/customsearch/v1?key=AIzaSyDj4oDbphHS81GkioQqzVC43Et039KvFGQ&cx=004101686134906633925:ufq5lye8wom&q=${this.state.search_string}&fields=searchInformation,items(link,snippet,pagemap/metatags(og:title),pagemap/cse_thumbnail(src))&sort=date:d:s`)
       .then(response => {
         return response.json()
       })
       .then(json => {
         let newsdata = []
         json.items.map(item => {
           newsdata.push({ link: item.link, title: item.pagemap.metatags[0]['og:title'], image: item.pagemap.cse_thumbnail[0].src, time: item.snippet.split('.')[0] })
         })
         this.setState({ news: newsdata })
         this.setState({ refreshing: false })
       })

  }
  handleShowNewspage(link: string) {
    this.setState({ webview: true })
    this.setState({ uri: link })
  }
  handleRefresh() {
    this.setState({ show_searchbar: this.state.show_searchbar ? false : true })
    this.setState({ refreshing: true })
    this.fetchData()
    console.log('Refresh')
  }
  handleNextPage() {
    this.state.count = this.state.count + 10
    this.setState(this.state)
    console.log(this.state.count)
    fetch(`https://www.googleapis.com/customsearch/v1?key=AIzaSyDj4oDbphHS81GkioQqzVC43Et039KvFGQ&cx=004101686134906633925:ufq5lye8wom&q=visa&fields=searchInformation,items(link,snippet,pagemap/metatags(og:title),pagemap/cse_thumbnail(src))&sort=date:d:s&start=${this.state.count+1}`)
      .then(response => {
        return response.json()
      })
      .then(json => {
        json.items.map(item => {
          this.state.news.push({ link: item.link, title: item.pagemap.metatags[0]['og:title'], image: item.pagemap.cse_thumbnail[0].src,time: item.snippet.split('.')[0] })
        })
        //this.setState({ news: newsdata })
        this.setState(this.state)
      }) 
  }
  render() {
    let width = Dimensions.get('window').width
    let height = Dimensions.get('window').height
    return (
      <View style={styles.container} >
        {
          this.state.webview ?
            <View style={styles.container}>
              <View style={styles.webview_header}>
                <TouchableOpacity onPress={() => {this.state.loading= true; this.setState({ webview: false })}} hitSlop={{ top: 20, bottom: 20, left: 50, right: 40 }}>
                  <Text style={{ color: 'blue', fontSize: 18 }}>Back</Text>
                </TouchableOpacity>
              </View>
              <WebView
                onLoad={() => { this.setState({ loading: false }) }}
                source={{ uri: this.state.uri }} />
              {this.state.loading ?
                <ActivityIndicator
                  style={{ position: "absolute", top: height / 2, left: width / 2 }}
                  size="large" /> : null
              }
            </View> :
            <View style={styles.container}>
              {this.state.show_searchbar ?
                <View style={[styles.header, this.state.show_searchbar ? { marginTop: Platform.OS === 'ios' ? 20 : 0, } : '']}>
                  <SearchBar
                    platform={Platform.OS === 'ios' ? 'ios' : 'android'}
                    containerStyle={{ width: '100%' }}
                    searchIcon={{ size: 24 }}
                    onChangeText={(text) => { this.state.search_string = text; this.setState({ search_string: text }); console.log(this.state.search_string); this.fetchData() }}
                    onClear={() => { }}
                    placeholder='Search your interests' />
                </View> : null}
              <View style={[{ flex: 10 }, this.state.show_searchbar ? '' : { marginTop: Platform.OS === 'ios' ? 45 : 0, }]}>
                <ScrollView
                  refreshControl={
                    <RefreshControl
                      refreshing={this.state.refreshing}
                      onRefresh={() => this.handleRefresh()}
                    />}>
                  {this.state.news.map((item, i) => {
                    return <View key={i} style={styles.row}>
                      <Image
                        style={{ width: 80, height: 70, marginRight: 10, borderRadius: 5 }}
                        source={{ uri: item.image }}
                      />
                      <TouchableOpacity onPress={this.handleShowNewspage.bind(this, item.link)} >
                        <View style={{ width: width - 120 }}>
                          <Text style={styles.newstitle_font}>{item.title}</Text>
                          {
                            item.link.split('.')[0] === 'https://gulfnews' ?
                              <View style={{ flexDirection: 'row', justifyContent: 'space-between', }}>
                                <Text style={{ color: '#808080' }}>GulfNews</Text>
                                <Text style={{ color: '#808080' }}>{item.time}</Text>
                              </View> :
                              <View style={{ flexDirection: 'row', justifyContent: 'space-between', }}>
                                <Text style={{ color: '#808080' }}>{item.link.split('.')[1]}</Text>
                                <Text style={{ color: '#808080' }}>{item.time}</Text>
                              </View>
                          }
                        </View>
                      </TouchableOpacity>
                    </View>
                  })}
                  <View style={{ alignItems: 'center', padding: 5 }}>
                    {this.state.count >= 10 ?
                      <Text style={styles.loadbutton} onPress={() => this.handleNextPage()}>Load more </Text>
                      : null}
                  </View>
                </ScrollView>
              </View>
            </View>
        }
      </View>
    )
  }
}

