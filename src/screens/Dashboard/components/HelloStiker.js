import React, { useEffect, useState, useRef } from 'react';
import { Text, View, Dimensions } from 'react-native';
import { FormattedMessage } from 'react-intl';
import { useSelector } from 'react-redux';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const HelloStiker = () => {
    const state = useSelector((state) => state);
    const firstName = state.userData?.firstName;



    return (
        <>

                <View
                    style={{
                        // position: 'absolute',
                        // top: SCREEN_HEIGHT / 5,
                        // left: 20,
                        // right: 0,
                        // backgroundColor: '#fff',
                        // borderColor: '#ebf0f3',
                        // borderWidth: 2,
                        // borderRadius: 5,
                        flexDirection: 'row',
                        padding: 10,
                        marginTop:30
   
                    }}>
                    <View >
                        <Text style={{ fontSize: 20, flexWrap: 'wrap' }}>
                            {(() => {
                                const currentHour = new Date().getHours()
                                if (currentHour >= 0 && currentHour < 12) {
                                    return (
                                        <><FormattedMessage id="Good.Morning" />, </>
                                    )
                                } else if (currentHour >= 12 && currentHour < 17) {
                                    return (
                                        <><FormattedMessage id="Good.Afternoon" />, </>
                                    )
                                } else if (currentHour >= 17) {
                                    return (
                                        <><FormattedMessage id="Good.Evening" />, </>
                                    )
                                } else {
                                    return (
                                        <Text>Hello</Text>
                                    )
                                }
                            })()}
                            {firstName}
                        </Text>
                        <Text style={{ fontSize: 14, flexWrap: "wrap", marginTop:10 }}><FormattedMessage id="Enjoy.your.work.day.with.Texxano" /></Text>
                    </View>
                    {/* <Image style={{}} source={require('../../../asset/image/123.jpg')} /> */}
                </View>
   
        </>
    );
};

export default HelloStiker;
