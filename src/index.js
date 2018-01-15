// Core Modules
const fs = require('fs');

// Framework
const Koa = require('koa');
const Router = require('koa-router');

// Ethereum
const Web3 = require('web3');
const solc = require('solc');

/*
 Compile Smart Contract
*/
const web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));
const code = fs.readFileSync('Voting.sol').toString();
const compiledCode = solc.compile(code);

/*
 Convert Contract to Bytecode
*/
const abiDefinition = JSON.parse(compiledCode.contracts[':Voting'].interface);
const VotingContract = web3.eth.contract(abiDefinition);
const byteCode = compiledCode.contracts[':Voting'].bytecode;

/*
 Start App
*/
const app = new Koa();
const router = new Router();
const contracts = [];

router.get('/', (ctx, next) => {
	ctx.body = 'Hello Koa';
	next();
});

router.post('/poll', (ctx, next) => {

	/*
	 Deploy Smart Contract
	*/
	contracts.push(VotingContract.new(['Rama', 'Nick', 'Jose'], {
		data: byteCode,
		from: web3.eth.accounts[0],
		gas: 4700000
	}));

	ctx.body = `{contract: ${contracts.length - 1}}`;
	next();
});

router.post('/vote', (ctx, next) => {
	const contractInstance = VotingContract.at(contracts[0].address);

	contractInstance.voteForCandidate('Rama', { from: web3.eth.accounts[0] });
	next();
});

router.get('/vote/:name', (ctx, next) => {
	const contractInstance = VotingContract.at(contracts[0].address);

	ctx.body = `{votes: ${contractInstance.totalVotesFor.call('Rama').toLocaleString()}}`;
	next();
});


app
	.use(router.routes())
	.use(router.allowedMethods());

app.listen(3000);
