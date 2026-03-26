import React from "react";
import { Text, View, StyleSheet } from 'react-native';
import { FormattedMessage } from 'react-intl';
import { useSelector } from "react-redux";

import { BytesToSize } from "../../../../utils/BytesToSize";

const DocumentSatistic = ({ }) => {
    const state = useSelector(state => state)
    const data = state.documentSatistic.data
    return (
        <View style={{ marginVertical: 10 }}>
            {!data?.parentId ? (
                <View style={styles.containerProgres}>
                    <View style={[styles.line, { backgroundColor: "#6c757d", width: `${(data?.size / data?.capacity) * 100}%` }]} />
                </View>
            ) : null}
            <View style={[styles.container, !data?.parentId ? styles.containerBottomRadius : styles.containerRadius]}>
                {data?.id ? (
                    <>
                        {data?.parentId ? (
                            <>
                                <Text><BytesToSize bytes={data?.size} /></Text>
                                <Text>({<FormattedMessage id="Total" />}:
                                    <BytesToSize bytes={data?.sizeIncludingSubs} />)
                                </Text>
                            </>
                        ) : (
                            <View>
                                <View style={{ flexDirection: "row" }}>
                                    <Text style={{}}>
                                        <BytesToSize bytes={data?.size} />
                                        <FormattedMessage id="of" /> {" "}
                                    </Text>
                                    <Text>
                                        <BytesToSize bytes={data?.capacity} />{" "}
                                        <FormattedMessage id="used" />{" "}
                                    </Text>
                                </View>

                                <Text>
                                    (<FormattedMessage id="Total" />:{" "}
                                    <BytesToSize bytes={data?.sizeIncludingSubs} />{" "}
                                    <FormattedMessage id="used" />)
                                </Text>
                            </View>
                        )}
                        <Text style={{ marginTop: 12 }}>
                            {data?.documentsNumber}{" "}
                            <FormattedMessage id="projects.tabs.documents.title" />{" "}
                            (<FormattedMessage id="Total" />: {data?.documentsNumberIncludingSubs}{" "}
                            <FormattedMessage id="projects.tabs.documents.title" />)
                        </Text>
                    </>
                ) : null}
            </View>
        </View>

    )
}
const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: "#ccc",
        shadowColor: '#ccc',
        // shadowOpacity: 0.5,
        // shadowRadius: 5,
        padding: 10,
        paddingTop: 5

    },
    containerBottomRadius: {
        borderBottomStartRadius: 5,
        borderBottomEndRadius: 5,
    },
    containerRadius: {
        borderRadius: 5,
    },
    containerProgres: {
        width: '100%',
        height: 7,
        backgroundColor: '#f5f5f5',
        overflow: 'hidden',
        borderTopEndRadius: 5,
        borderTopStartRadius: 5,
    },
    line: {
        position: 'absolute',
        top: 0,
        height: 7,

    },
});
export default DocumentSatistic
