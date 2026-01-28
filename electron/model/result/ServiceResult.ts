/**
 * 统一返回格式接口
 * 用于标准化所有数据库操作的返回结果
 */
export interface ServiceResult<T = any> {
    /** 操作是否成功 */
    success: boolean;
    /** 返回数据 */
    data?: T;
    /** 错误信息（仅在失败时存在） */
    message?: string;
    /** 其他元数据 */
    metadata?: any;
}



/**
 * ServiceResult 工厂类
 * 提供统一的方法来创建各种类型的返回结果
 */
export class ServiceResultFactory {
    /**
     * 创建成功结果
     */
    static success<T>(data?: T, message?: string, metadata?: any): ServiceResult<T> {
        return {
            success: true,
            data,
            message,
            metadata
        };
    }

    /**
     * 创建失败结果
     */
    static error<T>(message: string, data?: T, metadata?: any): ServiceResult<T> {
        return {
            success: false,
            message,
            data,
            metadata
        };
    }


}