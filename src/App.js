// @flow

import React, { Component } from 'react'
import {
  Platform,
  Dimensions,
  Text,
  View,
  Image,
  TouchableOpacity,
  RefreshControl,
  WebView,
  ScrollView,
  ActivityIndicator,
  Share,
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
const KEY = 'ENTER_YOUR_KEY_HERE'
const cx = 'ENTER_YOUR_ID_HERE'
export default class App extends Component<Props, State> {
  constructor() {
    super()
    this.state = {
      refreshing: false,
      webview: false,
      loading: true,
      search_string: 'visa',
      show_searchbar: false,
      load_more: false,
      uri: '',
      news: [],
      count: 0,
      clear_icon: true
    }
  }
  componentDidMount() {
    this.fetchData()
    SplashScreen.hide()
  }
  fetchData() {
    this.setState({ load_more: true })
    if (this.state.search_string === '') this.state.search_string = 'visa'
    fetch(`https://www.googleapis.com/customsearch/v1?key=${KEY}&cx=${cx}&q=${this.state.search_string}&fields=searchInformation,items(link,snippet,pagemap/metatags(og:title),pagemap/cse_thumbnail(src))`)
      .then(response => {
        return response.json()
      })
      .then(json => {
        let newsdata = []
        json.items.map(item => {
          newsdata.push({ link: item.link, title: item.pagemap.metatags[0]['og:title'], image: item.pagemap.cse_thumbnail[0].src, time: item.snippet.split('.')[0] })
        })
        this.state.news = newsdata
        this.state.count = this.state.count + 10
        this.state.load_more = false
        this.state.refreshing = false
        this.setState(this.state)
      })
  }
  handleShowNewspage(link: string) {
    this.setState({ webview: true })
    this.setState({ uri: link })
  }
  handleRefresh() {
    this.state.show_searchbar = this.state.show_searchbar ? false : true
    this.state.refreshing = true
    this.state.search_string = 'visa'
    this.state.clear_icon = this.state.search_string === '' ? false : true
    this.setState(this.state)
    this.fetchData()
  }
  handleChangeText(text) {
    this.state.search_string = text
    this.state.clear_icon = this.state.search_string === '' ? false : true
    this.setState(this.state)
  }
  handleLoadMore() {
    this.setState({ load_more: true })
    fetch(`https://www.googleapis.com/customsearch/v1?key=${KEY}&cx=${cx}&q=${this.state.search_string}&fields=searchInformation,items(link,snippet,pagemap/metatags(og:title),pagemap/cse_thumbnail(src))&start=${this.state.count + 1}`)
      .then(response => {
        return response.json()
      })
      .then(json => {
        json.items.map(item => {
          this.state.news.push({ link: item.link, title: item.pagemap.metatags[0]['og:title'], image: item.pagemap.cse_thumbnail[0].src, time: item.snippet.split('.')[0] })
        })
        this.state.count = this.state.count + 10
        this.state.load_more = false
        this.setState(this.state)
        console.log(this.state.count)
      })
  }
  handleShare(title, link) {
    Share.share({
      message: undefined,
      url: `${link}`,
      title: `${title}`,
    },
      {
        dialogTitle: `${title}`,
      }).then(result => {
        console.log(result)
      })
      .catch(err => console.log(err))
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
                <TouchableOpacity onPress={() => { this.state.loading = true; this.setState({ webview: false }) }} hitSlop={{ top: 20, bottom: 20, left: 50, right: 40 }}>
                  <Text style={{ color: '#808080', fontSize: 18, paddingBottom: 5 }}>Back</Text>
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
                    clearIcon={this.state.clear_icon}
                    containerStyle={{ width: '100%' }}
                    inputStyle={{ fontSize: 16 }}
                    searchIcon={{ size: 28 }}
                    returnKeyType={'done'}
                    value={this.state.search_string}
                    onChangeText={this.handleChangeText.bind(this)}
                    onSubmitEditing={() => this.fetchData()}
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
                      <View style={{ width: width - 120 }}>
                        <TouchableOpacity onPress={this.handleShowNewspage.bind(this, item.link)} >

                          <Text style={styles.newstitle_font}>{item.title}</Text>
                          {
                            item.link.split('.')[0] === 'https://gulfnews' ?
                              <View style={{ flexDirection: 'row', justifyContent: 'space-between', }}>
                                <Text style={{ color: '#808080' }}>GulfNews</Text>
                                <Text style={{ color: '#808080' }}>{item.time}|</Text>
                              </View> :
                              <View style={{ flexDirection: 'row', justifyContent: 'space-between', }}>
                                <Text style={{ color: '#808080' }}>{item.link.split('.')[1]}</Text>
                                <Text style={{ color: '#808080' }}>{item.time}|</Text>
                              </View>
                          }
                        </TouchableOpacity>
                        <TouchableOpacity style={{ flexDirection: 'row-reverse', padding: 5 }} hitSlop={{ top: 10, bottom: 10, left: 30, right: 30 }}>
                          <Icon
                            name={Platform.OS === 'ios' ? 'ios-share-outline' : 'share'}
                            type={Platform.OS === 'ios' ? 'ionicon' : 'material'}
                            size={24}
                            color='#808080'
                            onPress={this.handleShare.bind(this, item.title, item.link)} />
                        </TouchableOpacity>
                      </View>

                    </View>
                  })}
                  <View style={{ alignItems: 'center', padding: 5 }}>
                    {this.state.count >= 10 && !this.state.load_more ?
                      <Text style={styles.loadbutton} onPress={() => this.handleLoadMore()}>Load more</Text>
                      : null}
                    {this.state.load_more ?
                      <ActivityIndicator
                        style={{}}
                        size="large" /> : null
                    }
                  </View>
                </ScrollView>
              </View>
            </View>
        }
      </View>
    )
  }
}


