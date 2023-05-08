export async function fetchServer(monitorResource: { endpoint: string, options?: string }) {
    let { endpoint, options } = monitorResource
    let response
    if (options) {
        response = await fetch(endpoint, {
            ...JSON.parse(options)
        })
        return response
    }
    return await fetch(endpoint)
}
