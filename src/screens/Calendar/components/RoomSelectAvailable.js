import React, { useEffect, useState } from 'react'
import { useIntl, injectIntl } from 'react-intl'
import DropDownPicker from "react-native-dropdown-picker";

import http from "../../../services/http";

const RoomSelectAvailable = ({ reserveRoom, room, setRoom, start, end }) => {
    const intl = useIntl();

    const [roomsData, setRoomsData] = useState([]);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        const getData = async () => {
        if (reserveRoom && start && end) {
            http.get(`/calendarm/rooms/available?startDate=${start.toISOString()}&endDate=${end.toISOString()}`).then((data) => {
                setRoomsData(
                    data?.map((value) => ({
                        label: value.name,
                        value: value.id,
                    }))
                );
            });
        }
    };
    getData();
    }, [reserveRoom, start, end]);

    return (
        <>
            <DropDownPicker
                open={open}
                setOpen={setOpen}
                value={room}
                items={roomsData}
                setValue={setRoom}
                zIndex={9999}
                // placeholder={intl.formatMessage({ id: 'Calendar.Room.List' })}
                listMode={"SCROLLVIEW"}
                style={{
                    fontSize: 13,
                    borderColor: "#dee2e6",
                    borderRadius: 5,
                    width: '100%',
                    backgroundColor: "#fff",
                }}
                dropDownContainerStyle={{
                    borderColor: "#dee2e6",
                    width: '100%',
                }}
                listItemLabelStyle={{
                    fontWeight: "500",
                    fontSize: 15
                }}
                textStyle={{
                    fontWeight: "500",
                    fontSize: 15
                }}
                dropDownDirection="TOP"
            // disabled={false}
            />
        </>
    )
}

export default injectIntl(RoomSelectAvailable)
