import React, { useState } from "react";
import { ActivityIndicator, TouchableOpacity, View, TouchableNativeFeedback, Image, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { Text, Input, Box, Button } from "native-base"
import { useDispatch, useSelector } from "react-redux";
import { FormattedMessage } from 'react-intl';
import { forgotPassword } from "../../redux/actions/Authentication/userAuth.actions"
import { NavigationService } from "../../navigator";
import { validateEmail } from '../../utils/validate'
import { styles } from '../../asset/style/Authentications.styles'
import AppContainerClean from "../../components/AppContainerClean";

const ForgotPassword = () => {
    const state = useSelector(state => state)
    const titleFailure = state.forgotPassword.title
    const titleSuccess = state.forgotPassword.success

    const request = state.forgotPassword.request
    const dispatch = useDispatch();
    const [email, setEmail] = useState("");
    const [submitted, setSubmitted] = useState(false);
    const [validateEmailStaus, setvalidateEmailStaus] = useState(false);
    const handleLogIn = () => {
        setSubmitted(true)
        if ((submitted && !email)) {
        } else if (!validateEmail(email.trim())) {
            setvalidateEmailStaus(true)
        } else {
            dispatch(forgotPassword(email.trim()));
            setvalidateEmailStaus(false)
        }
    };

    return (
        <AppContainerClean location={'Login'}>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
                <Box style={styles.box}>
                    <View style={styles.box2}>
                        <TouchableNativeFeedback onPress={() => { NavigationService.navigate('Login') }}>
                            <Image style={styles.logo} source={require('../../asset/image/logo.png')} />
                        </TouchableNativeFeedback>
                        <Text mb={3} fontSize="xl" fontWeight={600}><FormattedMessage id="trouble.logging.in" /></Text>
                        <Text fontSize="md" style={{ textAlign: "center" }}>
                            <FormattedMessage id="username.back.account" />
                        </Text>
                        <FormattedMessage id="login.form.username.placeholder">
                            {placeholder =>
                                <Input
                                    size={"lg"}
                                    _focus
                                    w="80%"
                                    type="text"
                                    placeholder={placeholder.toString()}
                                    onChangeText={(e) => setEmail(e)}
                                    my={3}
                                    keyboardType="email-address"
                                    style={{ height: 40, backgroundColor: "#fff" }}
                                    />
                            }
                        </FormattedMessage>
                        {submitted && !email && <Text style={styles.textError}><FormattedMessage id="login.form.email.error.required"/></Text>}
                        {submitted && validateEmailStaus && <Text style={styles.textError}><FormattedMessage id="projects.form.users.email.error.format" /></Text>}
                        {submitted && titleFailure ? (<Text style={styles.textError}><FormattedMessage id={titleFailure} /></Text>) : (<></>)}
                        {submitted && titleSuccess ? (<Text style={{ fontSize: 14, color: "#28a745", textAlign: "center" }}><FormattedMessage id="system.sent.email" /></Text>) : (<></>)}

                        <TouchableOpacity style={[styles.button, styles.buttonAdd]} onPress={handleLogIn}>
                            {request ? (<ActivityIndicator size="small" color="#fff" />
                            ) : (<><Text style={styles.textSend}
                            ><FormattedMessage id="send.login.link" /></Text>
                            </>)
                            }
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => { NavigationService.navigate('Login', {}) }} style={{ marginTop: 20, }}>
                            <Text style={styles.textSend}><FormattedMessage id="common.button.login" /></Text>
                        </TouchableOpacity>
                    </View>
                </Box>
            </TouchableWithoutFeedback>
        </AppContainerClean>
    )
}

export default ForgotPassword;
