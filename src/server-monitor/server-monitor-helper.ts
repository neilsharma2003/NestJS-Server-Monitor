export async function fetchServer(monitorResource: { endpoint: string, options?: string }) {
    let { endpoint, options } = monitorResource
    let response
    if (options) {
        try {
            response = await fetch(endpoint, {
                ...JSON.parse(options)
            })
        }
        catch (err) {
            throw new Error(`JSON body is malformed: ${err}`)
        }
        return response
    }
    return await fetch(endpoint)
}
