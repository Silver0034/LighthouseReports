'use strict'

// packages
const fs = require('fs')
const lighthouse = require('lighthouse')
const chromeLauncher = require('chrome-launcher')
const reader = require('readline-sync')

// get input file name & output file name
let inputName = reader.question(
	'Input CSV File Name (Must be in this directory, must be a .csv file): '
)
if (!inputName.endsWith('.csv')) inputName += '.csv'
let outputName = reader.question(
	'Output File Name (Will overwrite if file already exists): '
)
if (!outputName.endsWith('.csv')) outputName += '.csv'

// start timer
const startTime = new Date()

// get input URLs
const urls = fs.readFileSync(`./input/${inputName}`).toString().split('\n')

// create string for csv
let csvString = ''

;(async () => {
	// launch headless chrome
	const chrome = await chromeLauncher.launch({
		chromeFlags: ['--headless']
	})

	// debug outputs for lighthouse
	const options = {
		logLevel: 'info',
		output: 'csv',
		port: chrome.port
	}

	// for each url
	for (const urlIterator in urls) {
		// log progress
		const current = parseInt(urlIterator) + 1
		const percentage = Math.floor((current / urls.length) * 100)
		console.log(
			`\n-- ${percentage}%, ${current} out of ${urls.length} -- "${urls[urlIterator]}"\n`
		)

		// if url is blank, skip
		if (!urls[urlIterator]) continue

		// set the modes to benchmark
		const strategies = ['mobile', 'desktop']

		// run for each strategy
		for (const strategyIterator in strategies) {
			// create array to hold scores
			const scores = []

			let visitedURL = 'NA'

			// run five times to average scores
			for (let i = 0; i < 5; i++) {
				console.log(
					`\n - ${strategies[strategyIterator]} ${i + 1} of 5 \n`
				)

				// set strategy to options
				options.strategy = strategies[strategyIterator]

				// run lighthouse
				const runnerResult = await lighthouse(
					urls[urlIterator],
					options
				)

				// add scores or "NA" if not found
				for (const category in runnerResult.lhr.categories) {
					// create array for category if it does not exist
					if (!scores[category]) scores[category] = []

					// add url if not yet set
					if (runnerResult.lhr.finalUrl && visitedURL === 'NA') {
						visitedURL = runnerResult.lhr.finalUrl
					}

					// add scores to respective categories
					if (runnerResult.lhr.categories[category].score) {
						const score =
							runnerResult.lhr.categories[category].score * 100
						scores[category].push(score)
					}
				}
			}

			// add headers if csvString is empty
			if (csvString === '') {
				csvString += 'URL'

				for (const x in strategies) {
					for (const cat in scores) {
						const strategy =
							strategies[x].charAt(0).toUpperCase() +
							strategies[x].slice(1)

						const category =
							cat.charAt(0).toUpperCase() + cat.slice(1)

						csvString += `, ${strategy}_${category}`
					}
				}
			}

			// add new line and url if first time through for current url
			if (strategyIterator === '0') {
				csvString += `\n ${visitedURL}`
			}

			// average scores and add to csv
			for (const category in scores) {
				// remove all empty and non-number values from array
				const filteredScores = scores[category].filter((value) => {
					return !isNaN(parseFloat(value)) && isFinite(value)
				})

				// add each score to sum
				if (filteredScores.length) {
					const sum = filteredScores.reduce((a, b) => a + b)
					const average = sum / filteredScores.length

					// add to csv
					csvString += `, ${Math.floor(average)}`
				} else {
					// add N/A to score
					csvString += `, N/A`
				}
			}
		}
	}

	// make output directory if it doesn't exist
	const outputDir = './output'
	if (!fs.existsSync(outputDir)) {
		fs.mkdirSync(outputDir)
	}
	// output scores to csv
	fs.writeFileSync(`${outputDir}/${outputName}`, csvString)

	// kill chrome at end
	await chrome.kill()

	const endTime = new Date()
	const elapsedTime = Math.round((endTime - startTime) / 1000)

	let minutes = Math.floor(elapsedTime / 60)
	let seconds = elapsedTime % 60

	// log that the program has finished
	console.log(
		`Report has finished. Took ${minutes} minutes and ${seconds} seconds`
	)
})()
