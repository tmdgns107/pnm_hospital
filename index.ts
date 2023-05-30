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

        if(event.httpMethod === 'GET'){
            /** GET Hospital item or items **/
            let queryString: any = event.queryStringParameters;
            let id: string, sidoNm: string, sigunNm: string, dongNm: string;
            if(queryString && queryString.id)
                id = queryString.id;
            if(queryString && queryString.sidoNm)
                sidoNm = decodeURI(queryString.sidoNm);
            if(queryString && queryString.sigunNm)
                sigunNm = decodeURI(queryString.sigunNm);
            if(queryString && queryString.dongNm)
                dongNm = decodeURI(queryString.dongNm);

            let searchQuery: string;
            let values: any[] = [];

            if(id){
                searchQuery = `SELECT * FROM ${tableName} WHERE id = ?`;
                values = [id];
            }else{
                let whereClause: string = "(status <> '폐업')";
                if (sigunNm && dongNm) {
                    whereClause += " AND (lotNoAddr LIKE CONCAT('%', ?, '%')) AND (sigunNm = ?)";
                    values = [dongNm, sigunNm];
                } else if (sigunNm) {
                    whereClause += " AND (sigunNm = ?)";
                    values = [sigunNm];
                } else if (sidoNm) {
                    whereClause += " AND (sidoNm = ?)";
                    values = [sidoNm];
                } else {
                    console.log("The search parameter is required.");
                    response.statusCode = 400;
                    responseBody.message = 'The search parameter is required.';
                    response.body = JSON.stringify(responseBody);
                    return response;
                }
                searchQuery = `SELECT id, sidoNm, sigunNm, bizPlcNm, roadNmAddr, lotNoAddr, lat, lng FROM ${tableName} WHERE ${whereClause}`;
            }

            console.log("searchQuery", searchQuery);
            console.log("values", values);
            let items = await util.queryMySQL(connection, searchQuery, values);
            console.log("Search items", items);

            response.statusCode = 200;
            responseBody.Items = items;
            responseBody.message = 'success';
            response.body = JSON.stringify(responseBody);
            return response;
        }else if(event.httpMethod === 'POST'){
            /** Hospital rating **/

        }

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
