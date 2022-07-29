import dotenv from 'dotenv';
dotenv.config();
import axios from 'axios';

let total = [];

const RiotKeyHeaders = { headers: { 'X-Riot-Token': process.env.RIOT_TOKEN } };

const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

const championName = 'Jax';

const region = ['euw1', 'ru'];
// [Accounts EUW] [Accounts RU]
const accounts = [
    [
        ''
    ],
    [
        ''
    ],
]

const link = {
    championID: 'http://ddragon.leagueoflegends.com/cdn/6.24.1/data/en_US/champion.json',
    summonerID: 'https://{region}.api.riotgames.com/lol/summoner/v4/summoners/by-name/{summonerName}',
    masteryChampion: 'https://{region}.api.riotgames.com/lol/champion-mastery/v4/champion-masteries/by-summoner/{summonerID}/by-champion/{championID}'
};

const getChampionID = (callback) => {
    axios.get(link.championID).then((data) => {
        callback(data.data.data[championName].key);
    });
};

const getSumonnerID = (region, accounts, callback) => {
    const linkparsed = link.summonerID.replace('{region}', region).replace('{summonerName}', encodeURI(accounts));

    axios.get(linkparsed, RiotKeyHeaders).then((data) => {
        callback(data.data.id);
    }).catch((err) => console.log(err.response.data));
};

const getMastery = (region, accounts, champID, callback) => {
    const linkparsed = link.masteryChampion.replace('{region}', region).replace('{summonerID}', accounts).replace('{championID}', champID);

    axios.get(linkparsed, RiotKeyHeaders).then((data) => {
        callback(data.data.championPoints);
    }).catch((err) => console.log(err.response.data));
};


getChampionID(async (champID) => {
    for (let select = 0; select < accounts.length; select++) {
        const regions = region[select];
        const number = accounts[select].length;
        for (let index = 0; index < number; index++) {
            getSumonnerID(regions, accounts[select][index], (data) => {
                getMastery(regions, data, champID, (data) => {
                    total.push(data);
                    console.log(data + ` : sur le compte ${accounts[select][index]} en ${regions}`);
                });
            });
            await delay(1000);
        };
    };
    console.log(new Intl.NumberFormat('fr-FR').format(total.reduce((previousValue, currentValue) => previousValue + currentValue)) + ' Points sur ' + championName);
});