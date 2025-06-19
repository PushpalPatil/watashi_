import { chart2txt } from 'chart2txt';


const ASTRO_API = process.env.ASTROLOGY_API_KEY

const chartData = {
    planets: [
        { name: 'Sun', degree: 35 },  // 5° Taurus
        { name: 'Moon', degree: 120 }, // 0° Leo
        { name: 'Mercury', degree: 75 } // 15° Gemini
    ],
    ascendant: 0 // 0° Aries
};

const settings = {
    // modified settings go here
};

const textDescription = chart2txt(chartData, settings);
console.log(textDescription);

