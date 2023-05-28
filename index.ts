import { APIGatewayProxyEvent, APIGatewayProxyResultV2, Handler } from 'aws-lambda';
import mysql from 'mysql2/promise';
import * as util from "./util";

export const handler: Handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResultV2> => {
    console.log("Event", event);

    let alias: string = 'dev';
    let tableName: string = 'hospitals_test';
    if(event.requestContext.path.includes('/prod/') || event.requestContext.path.includes('/live/')) {
        alias = 'prod';
        tableName = 'hospitals';
    }
    let queryString: any = event.queryStringParameters;
    let id: string, sidoNm: string, sigunNm: string;
    if(queryString && queryString.id)
        id = queryString.id;
    if(queryString && queryString.sidoNm)
        sidoNm = queryString.sidoNm;
    if(queryString && queryString.sigunNm)
        sigunNm = queryString.sigunNm;

    let response: APIGatewayProxyResultV2 = {
        statusCode: 200,
        body: ''
    };
    let responseBody: { message: string; Items: any[] } = {
        message: '',
        Items: []
    };

    let connection;
    try {
        /** MySQL 연결 **/
        connection = await mysql.createConnection({
            host: process.env[`${alias.toUpperCase()}_DB_HOST`],
            user: process.env[`${alias.toUpperCase()}_DB_USER`],
            password: process.env[`${alias.toUpperCase()}_DB_PASSWORD`],
            port: 3306,
            database: process.env[`${alias.toUpperCase()}_DB_NAME`]
        });

        let searchUpdateTimeQuery: string = `SELECT updateTime FROM ${tableName} ORDER BY updateTime DESC LIMIT 1`
        let lastUpdateTime: any = await util.queryMySQL(connection, searchUpdateTimeQuery, []);
        console.log(`lastUpdateTime: ${JSON.stringify(lastUpdateTime)}, type: ${typeof lastUpdateTime}`);

        response.statusCode = 200;
        responseBody.message = 'success.';
        response.body = JSON.stringify(responseBody);
        return response;
    } catch (e) {
        console.log("Error in db connection", e);

        response.statusCode = 400;
        responseBody.message = 'An error occurred while executing the query.';
        response.body = JSON.stringify(responseBody);
        return response;
    } finally {
        if (connection) {
            connection.end();
        }
    }
};
