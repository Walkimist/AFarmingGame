var root = document.querySelector(':root')

let wheat = 0
let money = 0
let token = 0
let farmSize = 3
let farmSpaces = farmSize * farmSize
root.style.setProperty('--size', farmSize)

let sellValue = 0.1

let farmingSpeed = 2000

let largeArea = false
let tokenChance = 5
let regrowChance = 0
let ind = 0

let sizeUpgradeCost = 5
let speedUpgradeCost = 0.5
let tokenChanceCost = 1
let regrowChanceCost = 10

const nodeContainer = document.getElementById('nodeContainer')

function createNode(index) {
    const node = document.createElement('button')
    if (checkLeftEdge(index)) {
        node.setAttribute('edge', 'left')
    } else if (checkRightEdge(index)) {
        node.setAttribute('edge', 'right')
    } else {
        node.setAttribute('edge', false)
    }
    node.classList.add('farmNode')
    node.setAttribute('dataIndex', index)

    return node
}

function increaseSize() {
    if (checkBuy(sizeUpgradeCost, 'money')) {
        sizeUpgradeCost *= 25
        updateUI("sizeIncreaseCost", sizeUpgradeCost, 2)
        while (nodeContainer.firstChild) {
            nodeContainer.removeChild(nodeContainer.firstChild)
        }
        farmSize++
        farmSpaces = farmSize * farmSize
        root.style.setProperty('--size', farmSize)
        ind = 0
        createFarm()
    }
}

function increaseSpeed() {
    if (checkBuy(speedUpgradeCost, 'money')) {
        speedUpgradeCost *= 1.5
        updateUI("speedIncreaseCost", speedUpgradeCost, 2)
        farmingSpeed -= 200
    }
}

function increaseTokenChance() {
    if (checkBuy(tokenChanceCost, 'token')) {
        tokenChanceCost *= 2
        updateUI("tokenChanceCost", tokenChanceCost, 2)
        tokenChance += 5
    }
}

function increaseRegrowChance() {
    if (checkBuy(regrowChanceCost, 'token')) {
        regrowChanceCost *= 2
        updateUI("regrowChanceCost", regrowChanceCost, 2)
        regrowChance += 5
    }
}

function sell() {
    document.getElementById("moneyDisplay").classList.remove("hidden")
    document.getElementById("moneyUpgradesDisplay").classList.remove("hidden")
    money += sellValue * wheat
    wheat = 0
    if (money >= sizeUpgradeCost / 3) document.getElementById("sizeIncreaseDisplay").classList.remove("hidden")
    updateUI("moneyAmount", money, 2)
}

generateSellPrice()
createFarm()
passByFarm()

function generateSellPrice() {
    sellValue = ((Math.random() * 3) + .2) / 10
    updateUI("sellValue", sellValue, 2)
    setTimeout(generateSellPrice, 10000)
}

function createFarm() {
    for (let i = 0; i < farmSpaces; i++) {
        const newNode = createNode(i)
        nodeContainer.appendChild(newNode)
    }
}

function passByFarm() {
    let node = document.querySelector('button[dataIndex="' + ind + '"]')
    node.classList.add('sel')
    setTimeout(function () { node.classList.remove('sel') }, farmingSpeed)
    if (!node.disabled) {
        removeCrop(node)
    }
    if (ind == farmSpaces - 1) {
        ind = 0
    } else {
        ind++
    }

    setTimeout(passByFarm, farmingSpeed)
}

function getNodeById(index) {
    let node = document.querySelector('button[dataIndex="' + index + '"]')
    return node
}

function removeCrop(node) {
    if (node && node.disabled == false) {
        if (getRng(tokenChance)) {
            document.getElementById("tokenDisplay").classList.remove("hidden")
            document.getElementById("tokenUpgradesDisplay").classList.remove("hidden")
            if (token >= regrowChanceCost / 3) document.getElementById("regrowChanceDisplay").classList.remove("hidden")
            token++
            updateUI("tokenAmount", token, 2)
        }
        wheat++
        updateUI("wheatAmount", wheat)
        node.classList.remove('wheat')
        node.classList.add('empty')
        node.disabled = true
        procRegrow(node)
        setTimeout(function () {
            restoreCrop(node)
        }, 5000)
    }
}

function procRegrow(node) {
    let index = node.getAttribute('dataIndex')
    if (getRng(regrowChance)) {
        if (!checkLeftEdge(index)) {
            restoreCrop(getNodeById(index - farmSize - 1))
            restoreCrop(getNodeById(index - 1))
            restoreCrop(getNodeById(index + farmSize - 1))
        }

        restoreCrop(getNodeById(index - farmSize))
        restoreCrop(getNodeById(index))
        restoreCrop(getNodeById(index + farmSize))

        if (!checkRightEdge(index)) {
            restoreCrop(getNodeById(index + 1))
            restoreCrop(getNodeById(index - farmSize + 1))
            restoreCrop(getNodeById(index + farmSize + 1))
        }
    }
}

function restoreCrop(node) {
    if (node && node.disabled) {
        node.classList.remove('empty')
        node.classList.add('wheat')
        node.disabled = false
    }
}

function checkLeftEdge(index) {
    let id = 0
    let ids = []
    for (let i = 0; i < farmSize; i++) {
        for (let j = 0; j < farmSize; j++) {
            if (j == 0) ids.push(id)
            id++
        }
    }
    if (ids.includes(index)) return true
    return false
}

function checkRightEdge(index) {
    let id = 0
    let ids = []
    for (let i = 0; i < farmSize; i++) {
        for (let j = 0; j < farmSize; j++) {
            if (j == farmSize - 1) ids.push(id)
            id++
        }
    }
    if (ids.includes(index)) return true
    return false
}

function checkBuy(cost, currency) {
    switch (currency) {
        case 'money':
            if (money >= cost) {
                money -= cost
                updateUI("moneyAmount", money, 2)
                return true
            }
            break
        case 'token':
            if (token >= cost) {
                token -= cost
                updateUI("tokenAmount", token, 2)
                return true
            }
            break
    }
    return false
}

function getRng(chance) {
    if (Math.ceil(Math.random() * 100) <= 100 * (chance / 100)) return true
    return false
}

function updateUI(id, value) {
    document.getElementById(id).innerHTML = value
}

function updateUI(id, value, parseValue) {
    document.getElementById(id).innerHTML = parseFloat(value.toFixed(parseValue))
}