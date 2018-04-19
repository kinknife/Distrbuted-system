const fs = require('fs-extra')
const path = require('path')
const filePath = path.resolve('C:\\working project\\Distrbuted-system\\uploaded files\\kinknife\\lịch học.PNG')

async function test() {
    let stats = await fs.stat(filePath)
    console.log(stats)
}

test()