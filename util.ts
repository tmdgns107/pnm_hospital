/** DB 쿼리 실행 **/
export async function queryMySQL(connection: any, query: string, values: any): Promise<any> {
    try {
        const [rows] = await connection.execute(query, values);
        return rows[0];
    } catch (e) {
        console.log("Error in queryMySQL", e)
        return false;
    }
}

