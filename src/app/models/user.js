const db = require('../../config/db')
const { hash } = require('bcryptjs')
const fs = require('fs')

const Product = require('../models/product')
const product = require('../models/product')
module.exports = {
    async findOne(filters) {
        let query = "SELECT * FROM users"

        Object.keys(filters).map(keys => {
            // WHERE | OR | AND
            query = `${query}
            ${key}
            `

            Object.keys(filters[key]).map(field => {
                query = `${query} ${field} = '${filters[key][field]}'`
            })
        })

        const results = await db.query(query)
        return results.rows[0]
    },
    async create(data) {
        try {
            const query = `
                INSERT INTO users (
                    name,
                    email,
                    password,
                    cpf_cnpj,
                    cep,
                    address
                ) VALUES ($1, $2, $3, $4, $5, $6)
                RETURNING id
            `
            // hash de senha
            const passwordHash = await hash(data.password, 8)
            
            const values = [
                data.name,
                data.email,
                passwordHash,
                data.cpf_cnpj.replace(/\D/g,""),
                data.cep.replace(/\D/g,""),
                data.address
            ]
            const results = await db.query(query, values)
            return results.rows[0].id
        } catch (error) {
            console.error(err)
        }

    },
    async update(id, fields) {
        let query = "UPDATE users SET"
        
        object.key(fields).map((key, index, array) => {
            if((index + 1) < array.lenght) {
                query = `${query}
                    ${key} = '${fields[key]}',
                `
            } else {
                query = `${query}
                    ${key} = '${fields[key]}'
                    WHERE id = ${id}
                `
            }
        })
        await db.query(query)
        return
    },
    async delete(id) {
        // pegar todos os products
        let results = await db.query('DELETE FROM products WHERE user_id = $1', [id])
        const products = results.rows
        // for products, catch your images
        const allFilesPromise = products.map(product =>
            Product.files(product.id))

        let promiseResults = await Promise.all(allFilesPromise)
        // remove userss
        await db.query('DELETE FROM users WHERE id = $1', [id])
        // delete this images
        promiseResults.map(results => {
            results.rows.map(file => {
                try {
                    fs.unlinkSync(file.path)
                } catch(err) {
                    console.error(err)
                }
            })
        })
    }
}