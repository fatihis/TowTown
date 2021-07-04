import React, {useState} from 'react';
import {View, Text, StyleSheet, TextInput, Button} from 'react-native';
import {Shadow} from 'react-native-neomorph-shadows';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import {NeuBorderView, NeuButton} from 'react-native-neu-element';

export default function Login({navigation}) {
  const [emailString, setEmailString] = useState();
  const [passwordString, setpasswordString] = useState();
  const [gotUserInfo, setGotUserInfo] = useState();
  const [gotUserType, setGotUserType] = useState('');

  onChangeEmail = text => {
    setEmailString(text);
  };

  getUserFb = async () => {
    console.log(auth().currentUser.uid);
    const gotUser = await firestore()
      .collection('Users')
      .doc(auth().currentUser.uid)
      .get();
    setGotUserInfo(gotUser.data());
    console.log(gotUser);
  };
  timeout = ms => {
    return new Promise(resolve => setTimeout(resolve, ms));
  };
  loginUser = async () => {
    auth()
      .signInWithEmailAndPassword(emailString, passwordString)
      .then(() => {
        console.log('Signed in!');
        timeout(200).then(() => {
          const gotUser = firestore()
            .collection('Users')
            .doc(auth().currentUser.uid)
            .get();
          console.log(gotUser, 'got');
          if (gotUser._data.userType === 'towUser') {
            navigation.navigate('CallHelp');
          } else {
            navigation.navigate('TowOperation');
          }
        });
      })
      .catch(error => {
        if (error.code === 'auth/invalid-email') {
          console.log('That email address is invalid!');
        }

        console.error(error);
      });
  };
  const getUserInformation = async () => {
    const gotUser = await firestore()
      .collection('Users')
      .doc(auth().currentUser.uid)
      .get();

    setGotUserType(gotUser.data().userType);
  };
  loginTest = async (emails, passwords, UT) => {
    auth()
      .signInWithEmailAndPassword(emails, passwords)
      .then(() => {
        getUserInformation();
        console.log('Signed in!');
        console.log(gotUserType, 'type');
        timeout(200).then(() => {
          console.log(auth().currentUser.uid, 'burda byle');
          if (UT === 'towUser') {
            navigation.navigate('CallHelp');
          } else {
            navigation.navigate('TowOperation', {
              towId: auth().currentUser.uid,
            });
          }
        });
      });
  };
  onChangePassword = text => {
    setpasswordString(text);
  };

  return (
    <View
      style={{
        height: '100%',
        width: '100%',
        alignContent: 'center',
        justifyContent: 'center',
        alignItems: 'center',
      }}>
      <NeuBorderView
        //Required
        width={300}
        height={400}
        color={'#eef2f9'}
        //Optional
        //Specify the width of the border
        //Default: 10
        borderWidth={10}
        //Optional
        //Specify the radius of the border
        //Default: 0
        borderRadius={16}>
        <NeuBorderView width={250} height={50} color={'#eef2f9'}>
          <TextInput
            style={styles.input}
            onChangeText={text => onChangeEmail(text)}
            placeholder="Email"
            keyboardType="email-address"
            placeholderTextColor="#000"
          />
        </NeuBorderView>
        <NeuBorderView width={250} height={50} color={'#eef2f9'}>
          <TextInput
            style={styles.input}
            onChangeText={text => onChangePassword(text)}
            placeholder="Password"
            keyboardType="default"
            secureTextEntry={true}
            placeholderTextColor="#000"
          />
        </NeuBorderView>
        <NeuButton
          color="#ffffff"
          width={200}
          height={50}
          borderRadius={16}
          onPress={loginUser}
          isConvex
          style={{marginTop: 30}}>
          <Text style={{fontSize: 22}}>LOGIN</Text>
        </NeuButton>

        <Button
          title="user"
          style={styles.testButtons}
          onPress={() =>
            loginTest('isk.fatih1@gmail.com', '123fatih1', 'towDriver')
          }></Button>
        <Button
          title="tow"
          style={styles.testButtons}
          onPress={() =>
            loginTest('fatih23psn@gmail.com', '123fatih', 'towUser')
          }></Button>
        <Text onPress={() => navigation.navigate('SignUp')}>
          Click Here To Signup
        </Text>
      </NeuBorderView>
    </View>
  );
}

const styles = StyleSheet.create({
  inputContainer: {
    height: '75%',
    width: '80%',
    borderWidth: 1,
    marginHorizontal: '10%',
    marginTop: '20%',
    alignContent: 'center',
    alignItems: 'center',
  },
  testButtons: {
    marginVertical: 10,
    backgroundColor: 'red',
  },
  input: {
    color: 'black',
  },
});
