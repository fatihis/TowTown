import React, {useState} from 'react';
import {View, Text, StyleSheet, TextInput, Button, Picker} from 'react-native';

import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

export default function Login({navigation}) {
  const [emailString, setEmailString] = useState();
  const [passwordString, setpasswordString] = useState();
  const [userTypeString, setuserTypeString] = useState('towUser');
  const [currentUid, setCurrentUid] = useState();
  const [selectedValue, setSelectedValue] = useState(0);
  const [phoneNumberString, setPhoneNumberString] = useState(0);
  onPressSignUp = () =>
    auth()
      .createUserWithEmailAndPassword(emailString, passwordString)
      .then(() => {
        const uidGet = auth().currentUser.uid;
        setCurrentUid(uidGet);
        firestore()
          .collection('Users')
          .doc(uidGet)
          .set({
            uid: uidGet,
            email: emailString,
            userType: userTypeString,
            phoneNumber: phoneNumberString,
            carType: selectedValue,
          })
          .then(() => {
            navigation.navigate('Login');
            alert('User account created!');
          });
      })
      .catch(error => {
        if (error.code === 'auth/email-already-in-use') {
          alert('Bu email adresi zaten kullanılıyor');
        }

        if (error.code === 'auth/invalid-email') {
          alert('Lütfen geçerli bir email adresi yazın');
        }
        if (error.code === 'auth/weak-password') {
          alert('Parolanız zayıf!');
        }

        console.error(error);
      });

  onChangeEmail = text => {
    setEmailString(text);
  };
  onChangePassword = text => {
    setpasswordString(text);
  };
  const onChangePhoneNumber = text => {
    setPhoneNumberString(text);
  };

  return (
    <View style={{height: '100%', width: '100%'}}>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          onChangeText={text => onChangeEmail(text)}
          placeholder="Email"
          keyboardType="email-address"
        />

        <TextInput
          style={styles.input}
          onChangeText={text => onChangePassword(text)}
          placeholder="Password"
          keyboardType="default"
          secureTextEntry={true}
        />
        <TextInput
          style={styles.input}
          onChangeText={text => onChangePhoneNumber(text)}
          placeholder="Phone Number"
          keyboardType="phone-pad"
        />
        <Picker
          selectedValue={selectedValue}
          style={{height: 50, width: 150}}
          onValueChange={(itemValue, itemIndex) => setSelectedValue(itemValue)}>
          <Picker.Item label="Sedan" value="Sedan" />
          <Picker.Item label="Truck" value="Truck" />
          <Picker.Item label="Hatchback" value="Hatchback" />
        </Picker>
        <Button
          style={styles.signUpButton}
          title="Sign Up"
          onPress={onPressSignUp}></Button>
      </View>
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
  signUpButton: {
    marginHorizontal: '100px',
  },
  input: {
    height: '10%',
    width: '85%',
    borderWidth: 1,
    marginVertical: '7%',
  },
});
