// 服务监控模型
export interface ServiceMonitor {
    id: number
    name: string
    serverName?: string
    type: ServiceType
    port: number
    status: string
    workspace: string,
    url: string,
    createTime: string,
    updateTime: string,
}

//服务类型，数据库，redis，mq，es，服务
export enum ServiceType {
    Database = 'database',
    Redis = 'redis',
    Mq = 'mq',
    Es = 'es',
    Service = 'service',
}
