const path = require('path')
const fs = require('fs-extra')

async function ensurePath(dir) {
	try {
		await fs.stat(dir)
	} catch (err) {
		await ensurePath(path.dirname(dir))
		await fs.mkdir(dir)
	}
}

module.exports = {ensurePath}