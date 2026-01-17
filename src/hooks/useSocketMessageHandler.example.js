/**
 * useSocketMessageHandler 使用示例
 * 
 * 这个文件展示了如何使用 useSocketMessageHandler Hook 来处理 Socket 消息
 * 
 * ## 特性
 * - 🚀 高性能: 使用 switch 语句替代 if-else，提高消息处理性能
 * - 🔧 可扩展: 支持自定义消息处理器，易于添加新的消息类型
 * - 📝 类型安全: 提供完整的 JSDoc 注释
 * - 🎯 模块化: 将消息处理逻辑从业务代码中分离，提高代码可维护性
 * - 🔄 可复用: 可在多个组件中复用，避免重复代码
 * 
 * ## 全局变量说明
 * 以下变量是全局注册的，不需要通过 context 传递：
 * - tkItemUtils - 试题工具类
 * - tkReq - 请求工具类  
 * - tkSocket - Socket 工具类
 * - tkNotify - 通知工具类
 * - tkTools - 通用工具类
 */

import { useSocketMessageHandler, SOCKET_MESSAGE_TYPES } from './useSocketMessageHandler';

// ==================== 基本使用示例 ====================

/**
 * 基本使用示例
 */
export function basicUsageExample() {
  // 1. 基本配置
  const {
    userLockItem,
    handleMessage,
    registerMessageHandler,
    addMessageHandler,
    removeMessageHandler,
    SOCKET_MESSAGE_TYPES,
  } = useSocketMessageHandler({
    bussId: 'your-business-id',
    context: {
      // 传递你的业务上下文数据
      questions: ref([]),
      getButtonPermission: (item) => { /* 权限处理逻辑 */ },
      // ... 其他需要的上下文数据
    },
  });

  // 2. 注册消息处理器
  registerMessageHandler({
    type: SOCKET_MESSAGE_TYPES.USER_JOIN,
    title: '提示',
    message: '用户进入页面',
  });

  return {
    userLockItem,
    handleMessage,
    registerMessageHandler,
    addMessageHandler,
    removeMessageHandler,
    SOCKET_MESSAGE_TYPES,
  };
}

// ==================== 自定义消息处理器示例 ====================

/**
 * 自定义消息处理器示例
 */
export function customHandlerExample() {
  const messageHandler = useSocketMessageHandler({
    bussId: 'your-business-id',
    context: {
      // 你的上下文数据
    },
    handlers: {
      // 自定义消息处理器
      'custom_message_type': async (data, context) => {
        console.log('处理自定义消息:', data);
        // 你的自定义逻辑
      },
      
      // 覆盖默认处理器
      [SOCKET_MESSAGE_TYPES.UPDATE_ITEM]: async (data, context) => {
        console.log('自定义更新试题处理:', data);
        // 你的自定义更新逻辑
        // 注意：可以直接使用全局变量，如 tkReq, tkItemUtils 等
        tkReq().path('customPath').send();
      },
    },
  });

  return messageHandler;
}

// ==================== 动态添加/移除处理器示例 ====================

/**
 * 动态处理器管理示例
 */
export function dynamicHandlerExample() {
  const {
    addMessageHandler,
    removeMessageHandler,
    SOCKET_MESSAGE_TYPES,
  } = useSocketMessageHandler({
    bussId: 'your-business-id',
    context: {},
  });

  // 动态添加处理器
  const customHandler = async (data, context) => {
    console.log('动态添加的处理器:', data);
  };
  
  addMessageHandler('dynamic_message', customHandler);
  
  // 动态移除处理器
  removeMessageHandler('dynamic_message');

  return {
    addMessageHandler,
    removeMessageHandler,
    SOCKET_MESSAGE_TYPES,
  };
}

// ==================== 在 Vue 组件中使用示例 ====================

/**
 * Vue 组件中使用示例
 */
export function vueComponentExample() {
  // 在 setup() 函数中使用
  const setupExample = () => {
    const questions = ref([]);
    const options = reactive({
      bussId: 'paper-detail-123',
      attrMarkSetting: true,
    });

    // 使用消息处理 Hook
    const {
      userLockItem,
      handleMessage,
      registerMessageHandler,
      SOCKET_MESSAGE_TYPES,
    } = useSocketMessageHandler({
      bussId: options.bussId,
      context: {
        questions,
        options,
        getButtonPermission: (item) => {
          // 权限处理逻辑
          console.log('处理权限:', item);
        },
        // 其他需要的上下文数据...
      },
    });

    // 注册消息处理器
    onMounted(() => {
      registerMessageHandler({
        type: SOCKET_MESSAGE_TYPES.USER_JOIN,
        title: '提示',
        message: '用户进入试卷详情页面',
      });
    });

    return {
      questions,
      userLockItem,
      handleMessage,
      SOCKET_MESSAGE_TYPES,
    };
  };

  return setupExample;
}

// ==================== 消息类型常量使用示例 ====================

/**
 * 消息类型常量使用示例
 */
export function messageTypesExample() {
  // 使用预定义的消息类型常量
  const messageTypes = {
    // 用户相关
    USER_JOIN: SOCKET_MESSAGE_TYPES.USER_JOIN,
    USER_LEAVE: SOCKET_MESSAGE_TYPES.USER_LEAVE,
    
    // 结构相关
    INSERT_STRUCT: SOCKET_MESSAGE_TYPES.INSERT_STRUCT,
    UPDATE_STRUCT: SOCKET_MESSAGE_TYPES.UPDATE_STRUCT,
    DELETE_STRUCT: SOCKET_MESSAGE_TYPES.DELETE_STRUCT,
    
    // 试题相关
    LOCK_ITEM: SOCKET_MESSAGE_TYPES.LOCK_ITEM,
    UNLOCK_ITEM: SOCKET_MESSAGE_TYPES.UNLOCK_ITEM,
    UPDATE_ITEM: SOCKET_MESSAGE_TYPES.UPDATE_ITEM,
    DELETE_ITEM: SOCKET_MESSAGE_TYPES.DELETE_ITEM,
  };

  return messageTypes;
}

// ==================== 错误处理示例 ====================

/**
 * 错误处理示例
 */
export function errorHandlingExample() {
  const messageHandler = useSocketMessageHandler({
    bussId: 'your-business-id',
    context: {},
    handlers: {
      // 带错误处理的自定义处理器
      'error_prone_message': async (data, context) => {
        try {
          // 可能出错的操作
          await someAsyncOperation(data);
        } catch (error) {
          console.error('消息处理失败:', error);
          // 错误恢复逻辑
        }
      },
    },
  });

  return messageHandler;
}

// ==================== 性能优化示例 ====================

/**
 * 性能优化示例
 */
export function performanceOptimizationExample() {
  // 使用防抖处理频繁的消息
  const debouncedHandler = debounce(async (data, context) => {
    // 处理逻辑
  }, 300);

  const messageHandler = useSocketMessageHandler({
    bussId: 'your-business-id',
    context: {},
    handlers: {
      'frequent_message': debouncedHandler,
    },
  });

  return messageHandler;
}

// 防抖函数
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}
