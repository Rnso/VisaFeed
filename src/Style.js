import { StyleSheet, Platform } from 'react-native'

export default StyleSheet.create({
  container: {
    flex: 1,    
    backgroundColor: '#F5F5F5',
  },
  header: {
    marginBottom: 10,  
    alignItems: 'center',
  },
  webview_header: {
    marginTop: 20,
    marginBottom: 5,
    marginLeft: 8,
    flexDirection: 'row',
  },
  header_font: {
    fontSize: 25,
    color: 'blue',
  },
  newstitle_font: {
    fontWeight: 'bold',
    paddingBottom: 5,
  },
  row: {
    marginBottom: 5,
    marginRight: 8,
    marginLeft: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    backgroundColor: 'white',
    padding: 5,
    borderRadius: 10,
  },
loadbutton:{
  color: '#808080', 
  fontSize: 18, 
}
})