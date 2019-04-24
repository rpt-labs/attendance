const Papa = require('papaparse');
const fs = require('fs');

function storeZoomRecords(zoomInput) {
  fs.readFile('data/zoom_records.csv', 'utf8', (err, data) => {
    const tmp = Papa.parse(data);

    const existingCSV = tmp.data
      .map(stu => {
        return {
          user_id: stu[0],
          user_name: stu[1],
          device: stu[2],
          ip_address: stu[3],
          location: stu[4],
          network_type: stu[5],
          microphone: stu[6],
          speaker: stu[7],
          camera: stu[8],
          data_center: stu[19],
          connection_type: stu[110],
          join_time: stu[111],
          share_application: stu[112],
          share_desktop: stu[113],
          share_whiteboard: stu[114],
          recording: stu[115],
          pc_name: stu[116],
          domain: stu[117],
          mac_addr: stu[118],
          harddisk_id: stu[219],
          version: stu[220],
          firstName: stu[221],
          lastName: stu[222],
          room: stu[223],
          timestamp: stu[224]
        };
      })
      .slice(1); // remove header from parse

    console.log(existingCSV[0]);
    const updatedCSV = existingCSV.concat(zoomInput);

    const csv = Papa.unparse(updatedCSV);

    fs.writeFile('data/zoom_records.csv', csv, err => {
      if (err) throw err;
    });
  });
}

module.exports = storeZoomRecords;
