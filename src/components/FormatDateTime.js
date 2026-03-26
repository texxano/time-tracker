import React from 'react'

const FormatDateTime = ({ datevalue, type }) => {
    let dateFormat = new Date(datevalue);
    let dd = String(dateFormat.getDate()).padStart(2, '0');
    let mm = String(dateFormat.getMonth() + 1).padStart(2, '0');
    let yyyy = dateFormat.getFullYear();
    let h = String(dateFormat.getHours()).padStart(2, '0');
    let m = String(dateFormat.getMinutes()).padStart(2, '0');
    dateFormat = dd + '/' + mm + '/' + yyyy
    let hoursFormat = h + ':' + m;
    return (
        <>
            {(() => {
                if (type === 0 && datevalue) {
                    return (<>{hoursFormat}</>)
                } else if (type === 1 && datevalue) {
                    return (<> {dateFormat}</>)
                } else if (type === 2 && datevalue) {
                    return (<>{hoursFormat} {dateFormat}</>)
                } else {
                    return (<></>)
                }
            })()}
        </>
    )
}

export default FormatDateTime
