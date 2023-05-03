// in front-end js i can't use require keyword... so const {ethers} = require("ethers"); won't work

import { abi, contractAddress } from "./constants.js"
import { ethers } from "./ethers-5.6.esm.min.js"

// const provider = new ethers.providers.JsonRpcProvider("http://localhost:8545")

// connect website to metamask using the connect button

const connectButton = document.getElementById("connectButton")
const fundButton = document.getElementById("fundButton")
const balanceButton = document.getElementById("balanceButton")
const withdrawButton = document.getElementById("withdrawButton")

connectButton.onclick = connect // why not connect() ??? with a parantheses
fundButton.onclick = fund
balanceButton.onclick = getBalance
withdrawButton.onclick = withdraw

console.log(ethers)

async function connect() {
    if (typeof window.ethereum !== "undefined") {
        // console.log("I see a metamask");
        // try {
        await window.ethereum.request({ method: "eth_requestAccounts" })
        // } catch (error) {
        // console.log(error)
        // }
        console.log("connected!")
        connectButton.innerHTML = "Connected! 🚀"
    } else {
        // console.log("No metamask");
        connectButton.innerHTML = "Please install metamask"
    }
}

/*
The error message Error: VM Exception while processing transaction: reverted with reason string 'You need to spend more ETH' indicates that the transaction failed because it did not provide enough ETH to complete the transaction successfully.
Looking at your code, it seems that the issue is in the fund() function, where you are passing the ethAmount value as a string to the value parameter, but you are not converting it to the expected format.
You can fix this by using the parseEther() function from the ethers.utils library to convert the ethAmount string to the expected format. Here is the modified code:
 */

async function getBalance() {
    if (typeof window.ethereum !== "undefined") {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const balance = await provider.getBalance(contractAddress)
        console.log(ethers.utils.formatEther(balance))
    }
}

async function fund() {
    const ethAmount = document.getElementById("ethAmount").value
    console.log(`Funding with ${ethAmount}`)

    if (typeof window.ethereum !== "undefined") {
        // provider / connection to the blockchain
        // signer / wallet / someone with some gas
        //contract that we're interacting with
        // ABI & Address

        // 👇 this provider is conencted to the metamask here
        const provider = new ethers.providers.Web3Provider(window.ethereum) // it is similar to the JsonRPC provider, which we used before, to choose which blockchain to connect to.
        const signer = provider.getSigner() // it will return whichever WALLET is connected to the provider. so, if i'm connected with a/c 1 of metamask will return a/c 1 or respectively
        console.log(signer)

        const contract = new ethers.Contract(contractAddress, abi, signer) // how to get our contract? // this is where, ABI and Address comes into play
        try {
            const transactionResponse = await contract.fund({
                value: ethers.utils.parseEther(ethAmount), // <-- fix here
            }) // this is how we're creating the transaction

            // wait for the transaction to be mined
            await listenForTranasactionMine(transactionResponse, provider)
            console.log("Done!✅")
        } catch (error) {
            console.log(error)
        }
    }
}

function listenForTranasactionMine(transactionResponse, provider) {
    console.log(`Mining ${transactionResponse.hash}...`)
    // return new promise()

    return new Promise((resolve, reject) => {
        // resolve => if it will wait for the complete tx to finish, and reject => for it, i can add some {timeout}, if it takes too long to respond.
        provider.once(transactionResponse.hash, (transactionReceipt) => {
            // using event listener to get -> transactionReceipt, and then initailizing an anonymous function.
            console.log(
                `completed with ${transactionReceipt.confirmations} confirmations`
            )
            resolve()
        })
    })
}

// what is event loop => instead of finishing something, add it into a queue

// const provider = new ethers.providers.Web3Provider(window.ethereum)

async function withdraw() {
    if (typeof window.ethereum !== "undefined") {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        console.log("withdrawing...")
        const signer = provider.getSigner()
        const contract = new ethers.Contract(contractAddress, abi, signer)
        try {
            const transactionResponse = await contract.withdraw()
            await listenForTranasactionMine(transactionResponse, provider)
        } catch (error) {
            console.log(error)
        }
    }
}

// async function withdraw() {
//     try {
//         console.log("Withdraw function called")
//         const signer = provider.getSigner()
//         console.log("Signer retrieved")
//         const contract = new ethers.Contract(contractAddress, abi, signer)
//         console.log("Contract instance created")
//         const transaction = await contract.withdraw()
//         console.log("Transaction sent", transaction)
//         await transaction.wait()
//         console.log("Transaction confirmed")
//     } catch (error) {
//         console.log("Withdraw error", error)
//     }
// }
