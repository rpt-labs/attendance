var Papa = require('papaparse');
var fs = require('fs');


function storeZoomRecords(zoomInput){

  fs.readFile('data/zoom_records.csv', 'utf8', (err, data) => {
    let tmp = Papa.parse(data)

    let existingCSV = tmp.data.map(stu => {
      return {
        user_id: stu[1],
        user_name: stu[2],
        device: stu[3],
        ip_address: stu[4],
        location: stu[5],
        network_type: stu[6],
        microphone: stu[7],
        speaker: stu[8],
        camera: stu[9],
        data_center: stu[10],
        connection_type: stu[11],
        join_time: stu[12],
        share_application: stu[13],
        share_desktop: stu[14],
        share_whiteboard: stu[15],
        recording: stu[16],
        pc_name: stu[17],
        domain: stu[18],
        mac_addr: stu[19],
        harddisk_id: stu[20],
        version: stu[21],
        firstName: stu[22],
        lastName: stu[23],
        room: stu[24],
        timestamp: stu[25]
      }
    }).slice(1) // remove header from parse

    let updatedCSV = existingCSV.concat(zoomInput)

    let csv = Papa.unparse(updatedCSV)

    fs.writeFile('data/zoom_records.csv', csv, (err) => {
      if (err) throw err;
    })

  })

}



module.exports = storeZoomRecords;
