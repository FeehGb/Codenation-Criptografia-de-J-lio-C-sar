const request   = require('request'     )
const fs        = require('fs'          )
const crypto    = require('crypto'      )

const nomeDoArquivo = "answer.json"
const token = "f0ab3298322ae37b8033e7161e8432dc435ac55f"

const descriptografar  = ( json ) => {
    
    let alfabeto        = [..."abcdefghijklmnopqrstuvwxyz"  ]
    let numero_casas    = json["numero_casas"               ]
    let letras          = [...json["cifrado"]               ]
    
    let textoDecifrado = letras.reduce(( textoCriado, letraAtual, index, self ) => {
        
        let posicaoAtual    = alfabeto.indexOf(letraAtual)
        let posicaoNova     = ( posicaoAtual ) - numero_casas
        while ( posicaoNova  < 0 ) 
            posicaoNova += alfabeto.length
        
        letraDesifrada = posicaoAtual > -1 ? alfabeto[posicaoNova] : letraAtual
        
        return  textoCriado += letraDesifrada
        
    },"")
    console.log(textoDecifrado)
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
    fs.writeFileSync(nome, dados, encoding, ( err ) => {
        if (err) throw err
        else console.log("s")
    })

const evniarDados = (token) => {
    
    console.log()
    formData = {
            answer      : fs.createReadStream(`${__dirname}\\${nomeDoArquivo}`)
        ,   filetype    : 'json'
        ,   filename    : nomeDoArquivo.replace(".json","")
    }
    headers = {
            "Content-Type"      : "multipart/form-data"  
        //,   "Content-Length"    : `${JSON.stringify(dados).length}`
        ,   "Authorization"     : `Basic ${token}`
    }
    
    let url =  `https://api.codenation.dev/v1/challenge/dev-ps/submit-solution?token=${token}`
    request.post({url, formData},
        (error, res, body) => {
            if (error)
                return
            
            console.log(`StatusCode: ${res.statusCode}`)
            console.log(body, res)
        }
    ) 
    
}

const criarSha1 = ( texto ) => { 
    let criarHash    = crypto.createHash('sha1')
    let dadosHash    = criarHash.update( texto, 'utf-8')
    let hashGerado   = dadosHash.digest('hex')
    
    return hashGerado;
}


pegarDadosApi(token).then(async ( resposta ) => {
    
    dados = JSON.parse(resposta)
    
    descriptografado = descriptografar(dados)
    hashGerado       = criarSha1(descriptografado)
    
    dados['decifrado'           ] = descriptografado
    dados['resumo_criptografico'] = hashGerado
    
    criarArquivo( nomeDoArquivo, JSON.stringify(dados) )
    evniarDados(token) 
    
}).catch(err => console.log(err))



