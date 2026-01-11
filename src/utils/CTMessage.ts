import { ElMessage, ElMessageBox, type MessageParamsWithType, type ElMessageBoxOptions } from 'element-plus';

// 封装Element Plus的消息提示
export const CTMessage = {
    // 成功消息
    success: (message: string, options?: MessageParamsWithType) => {
        return ElMessage.success(typeof options === 'object' ? { ...options, message } : message);
    },

    // 警告消息
    warning: (message: string, options?: MessageParamsWithType) => {
        return ElMessage.warning(typeof options === 'object' ? { ...options, message } : message);
    },

    // 信息消息
    info: (message: string, options?: MessageParamsWithType) => {
        return ElMessage.info(typeof options === 'object' ? { ...options, message } : message);
    },

    // 错误消息
    error: (message: string, options?: MessageParamsWithType) => {
        return ElMessage.error(typeof options === 'object' ? { ...options, message } : message);
    },

    // 确认对话框
    confirm: (message: string, title: string = '确认', options?: ElMessageBoxOptions) => {
        return ElMessageBox.confirm(message, title, {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning',
            ...(options || {})
        });
    },

    // 提示对话框
    alert: (message: string, title: string = '提示', options?: ElMessageBoxOptions) => {
        return ElMessageBox.alert(message, title, {
            confirmButtonText: '确定',
            type: 'info',
            ...(options || {})
        });
    },

    // 输入对话框
    prompt: (message: string, title: string = '输入', options?: ElMessageBoxOptions) => {
        return ElMessageBox.prompt(message, title, {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'info',
            ...(options || {})
        });
    }
};

// 先定义CTMessage的类型
type CTMessageType = typeof CTMessage;

// 扩展window对象的类型声明
declare global {
    interface Window {
        CTMessage: CTMessageType;
    }

    // 直接声明为全局变量，支持直接访问CTMessage而不需要window前缀
    var CTMessage: CTMessageType;
}

// 将CTMessage挂载到window对象和全局变量上
if (typeof window !== 'undefined') {
    window.CTMessage = CTMessage;
}

// 挂载到globalThis上，确保在所有环境下都能直接访问
(globalThis as any).CTMessage = CTMessage;
