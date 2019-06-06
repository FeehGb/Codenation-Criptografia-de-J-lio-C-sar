const request   = require('request'     )
const fs        = require('fs'          )
const crypto    = require('crypto'      )
const https     = require('https'       )


// Constantes
const nomeDoArquivo = "answer.json"
const token = "f0ab3298322ae37b8033e7161e8432dc435ac55f";

const descriptografar  = ( json ) => {
    
    let alfabeto        = [..."abcdefghijklmnopqrstuvwxyz"  ]
    let numero_casas    = json["numero_casas"               ]
    let letras          = [...json["cifrado"]               ]
    
    let textoDecifrado = letras.reduce(( textoCriado, letraAtual, index, self ) => {
        
        let posicaoAtual    = alfabeto.indexOf(letraAtual)
        let posicaoNova     = ( posicaoAtual ) - numero_casas
        while ( posicaoNova  < 0 ) 
            posicaoNova += alfabeto.length
        
        letraDesifrada = /(\w)/.test(letraAtual) ? alfabeto[posicaoNova] : letraAtual
        
        return  textoCriado += letraDesifrada
        
    },"")
    
    return textoDecifrado
    
}

const pegarDadosApi = (token) => {
    
    let url     = `https://api.codenation.dev/v1/challenge/dev-ps/generate-data?token=${token}`
    let conteudo = ''
    return new Promise((resolve, reject) => {
        request(url, (err, res, body) => {
            resolve(body)
            reject(err)
        })
    })
}

const criarArquivo = (nome, dados, encoding = "utf8") => 
    fs.writeFileSync(nome, dados, "utf8", ( err ) => {
        if (err) throw err
    })

const post = ( dados, token) => {
    console.log(dados)
    
    let url =  `https://api.codenation.dev/v1/challenge/dev-ps/submit-solution?token=${token}`
    request.post(url,dados,(error, res, body) => {
        if (error)
            return
        
        console.log(`StatusCode: ${res.statusCode}`)
        console.log(body)
        
    })
    
}


pegarDadosApi(token).then(( dados ) => {
    criarArquivo( nomeDoArquivo, dados )
}).catch(err => console.log(err));

const lerArquivo = ( arquivo ) => fs.readFileSync( arquivo )

dadosDoArquivo   = lerArquivo(nomeDoArquivo)
answerJson       = JSON.parse(dadosDoArquivo)
descriptografado = descriptografar(answerJson)

let criarHash    = crypto.createHash('sha1')
let dadosHash    = criarHash.update( descriptografado, 'utf-8')
let hashGerado   = dadosHash.digest('hex')

answerJson['decifrado'           ] = descriptografado
answerJson['resumo_criptografico'] = hashGerado

post(answerJson, token)

/* console.log(JSON.stringify(answerJson))
console.log("hash : ", hashGerado)
console.log("descriptografado : ", descriptografado) */



