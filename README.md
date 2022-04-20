# LighthouseReports

Generate a Lighthouse Report with node running a headless Chrome instance

This project gives you the average scores for mobile and desktop performance, accessibility, best-practices, and seo.

## How to Use

Create an "input" directory inside of the project folder. Add a .csv file with a list of URLs to benchmark with each URL on a new line. In the project directory run `node report.js`, it will ask for the name of your input csv file and ask for what you would like the output file to be named. After running it will output a new .csv in the "output" directory (and will create the directory if it does not yet exist). If the output .csv already exists it will be overwritten.

### Example Input CSV

```text
https://jlodes.com
https://github.com/Silver0034/LighthouseReports

```
