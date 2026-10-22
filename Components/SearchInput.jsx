import { View } from 'react-native';
import { StyleSheet } from 'react-native'
import { TextInput } from 'react-native'
import AllColors from '../assets/Colors';

export default function SearchInput(props) {
  return (
    <View style={Styles.searchInputContainer}>
        <TextInput onChangeText={props.searchHandler} style={Styles.SearchInputStyles} placeholderTextColor="#777" placeholder={props.title}/>
    </View>
  )
}
const Styles=StyleSheet.create({
    searchInputContainer:{
        borderBottomRightRadius:15,
        borderBottomLeftRadius:15,
        paddingHorizontal:16
    },
    SearchInputStyles:{
        padding:12,
        borderRadius:12,    
        borderColor:AllColors.greenColor,
        borderWidth:1,
        marginBottom:25,
        marginTop:5,
        fontFamily:"Cairo",
        fontSize:15,
        color:AllColors.grayColor,
        backgroundColor:AllColors.whiteColor,
        textAlign: "right",
        writingDirection: "rtl"
    }
})
