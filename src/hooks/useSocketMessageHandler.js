import { ref, reactive } from 'vue';
import tkItemUtils from '@/apps/hn_mt/utils/tkItemUtils.js';

/**
 * Socket 消息类型常量
 * 用于统一管理所有消息类型，便于维护和扩展
 */
export const SOCKET_MESSAGE_TYPES = {
  // 用户进入/离开相关
  USER_JOIN: 'join',
  USER_LEAVE: 'leave',
  
  // 试卷结构相关
  INSERT_STRUCT: 'insert_struct',           // 插入结构
  UPDATE_STRUCT: 'update_struct',           // 更新结构
  DELETE_STRUCT: 'delete_struct',           // 删除结构
  
  // 试题锁定相关
  LOCK_ITEM: 'lock_item',                   // 锁定试题
  UNLOCK_ITEM: 'unLock_item',               // 解锁试题
  
  // 试题操作相关
  UPDATE_ITEM: 'update_item',               // 更新试题
  DELETE_ITEM: 'del_item',                  // 删除试题
  
  // 权限同步相关
  SYNC_MT_TASK_PERMISSION: 'sync_mt_task_permisstion', // 同步命题任务权限
  
  // 批注相关
  SYNC_PAPER_COMMENT: 'sync_paper_comment', // 同步批注状态
};

/**
 * 通用 Socket 消息处理 Hook
 * 提供可扩展的消息处理机制，支持自定义处理器
 * 
 * @param {Object} options - 配置选项
 * @param {string} options.bussId - 业务ID，用于Socket连接
 * @param {Object} options.handlers - 自定义消息处理器映射
 * @param {Object} options.context - 上下文数据，传递给处理器
 * @returns {Object} 返回消息处理相关的方法和状态
 */
export function useSocketMessageHandler(options = {}) {
  const { bussId, handlers = {}, context = {} } = options;
  
  // 用户锁定项映射
  const userLockItem = reactive({});
  
  // 默认消息处理器
  const defaultHandlers = {
    /**
     * 处理用户进入/离开消息
     * @param {Object} data - 消息数据
     * @param {Object} context - 上下文数据
     */
    [SOCKET_MESSAGE_TYPES.USER_JOIN]: async (data, context) => {
      const { editingPaperStructure, notifyOtherUser, getStructItemById, questions, getButtonPermission } = context;
      
      // 如果当前用户在编辑，通知新进入的用户
      if (editingPaperStructure?.value?.editingItem?.id) {
        notifyOtherUser?.(
          {
            type: SOCKET_MESSAGE_TYPES.LOCK_ITEM,
            message: {
              id: editingPaperStructure.value.editingItem.id,
              editorTip: `${tkSocket.userInfo.userName}编辑试题中`,
            },
          },
          data.fromUser
        );
      }

      // 处理用户锁定项
      if (userLockItem[data.fromUser]) {
        const { current } = getStructItemById?.(
          questions?.value,
          userLockItem[data.fromUser]
        );
        if (current) {
          current.editorTip = '';
          getButtonPermission?.(current);
        }
      }

      // 显示通知消息
      if (data.message) {
        tkNotify({
          title: data.title,
          type: 'success',
          dangerouslyUseHTMLString: true,
          position: 'bottom-left',
          message: data.message,
          duration: 10000,
        });
      }
    },

    /**
     * 处理用户离开消息（与进入消息逻辑相同）
     */
    [SOCKET_MESSAGE_TYPES.USER_LEAVE]: async (data, context) => {
      // 复用进入消息的处理逻辑
      await defaultHandlers[SOCKET_MESSAGE_TYPES.USER_JOIN](data, context);
    },

    /**
     * 处理插入结构消息
     * @param {Object} data - 消息数据
     * @param {Object} context - 上下文数据
     */
    [SOCKET_MESSAGE_TYPES.INSERT_STRUCT]: async (data, context) => {
      const { questions } = context;
      const struct = data.message;
      
      // 找到上一个节点位置
      const { parent, current, next, index } = tkItemUtils.getPaperStructById(
        questions?.value,
        struct.previous
      );
      
      if (current) {
        current.next = struct.id;
      }
      if (next) {
        next.previous = struct.id;
      }
      parent?.splice(index + 1, 0, struct);
    },

    /**
     * 处理更新结构消息
     * @param {Object} data - 消息数据
     * @param {Object} context - 上下文数据
     */
    [SOCKET_MESSAGE_TYPES.UPDATE_STRUCT]: async (data, context) => {
      const { questions } = context;
      const struct = data.message;
      
      // 找到目标结构并更新
      const { current } = tkItemUtils.getPaperStructById(questions?.value, struct.id);
      if (current) {
        current.name = struct.name;
        current.description = struct.description;
        current.guidance = struct.guidance;
      }
    },

    /**
     * 处理删除结构消息
     * @param {Object} data - 消息数据
     * @param {Object} context - 上下文数据
     */
    [SOCKET_MESSAGE_TYPES.DELETE_STRUCT]: async (data, context) => {
      const { questions, totalCount } = context;
      const struct = data.message;
      
      // 找到目标结构并删除
      const { parent, pre, current, next, index } = tkItemUtils.getPaperStructById(
        questions?.value,
        struct.id
      );
      
      if (pre) {
        pre.next = next?.id ?? null;
      }
      if (next) {
        next.previous = pre?.id ?? null;
      }
      if (current) {
        parent?.splice(index, 1);
        totalCount?.value && totalCount.value--;
      }
    },

    /**
     * 处理锁定试题消息
     * @param {Object} data - 消息数据
     * @param {Object} context - 上下文数据
     */
    [SOCKET_MESSAGE_TYPES.LOCK_ITEM]: async (data, context) => {
      const { getStructItemById, questions } = context;
      const item = data.message;
      
      // 试题锁定，权限全部收回
      const { current } = getStructItemById?.(questions?.value, item.id);
      if (current) {
        current.editorTip = item.editorTip;
        current.leftBttton = current.leftBttton || {};
        current.rightBttton = current.rightBttton || {};
        
        // 禁用所有按钮权限
        current.leftBttton.insertItem = false;
        current.leftBttton.choiseItem = false;
        current.rightBttton.moveItem = false;
        current.rightBttton.editorItem = false;
        current.rightBttton.modifyItem = false;
        current.rightBttton.itemHistory = false;
        current.rightBttton.preGroup = false;
        current.rightBttton.markItem = false;
        current.rightBttton.delItem = false;
      }
      userLockItem[data.fromUser] = item.id;
    },

    /**
     * 处理解锁试题消息
     * @param {Object} data - 消息数据
     * @param {Object} context - 上下文数据
     */
    [SOCKET_MESSAGE_TYPES.UNLOCK_ITEM]: async (data, context) => {
      const { getStructItemById, questions, getButtonPermission } = context;
      const item = data.message;
      
      const { current } = getStructItemById?.(questions?.value, item.id);
      if (current) {
        current.editorTip = '';
        getButtonPermission?.(current);
      }
      delete userLockItem[data.fromUser];
    },

    /**
     * 处理更新试题消息
     * @param {Object} data - 消息数据
     * @param {Object} context - 上下文数据
     */
    [SOCKET_MESSAGE_TYPES.UPDATE_ITEM]: async (data, context) => {
      const { 
        EnterActivityDetailPageData,
        subjectPromise, 
        options, 
        questionTag, 
        getButtonPermission, 
        getStructItemById, 
        questions, 
        editingPaperStructure, 
        handleOnAttributeData, 
        paperSort 
      } = context;
      
      const itemData = data.message;
      
      tkReq?.()
        .path('getItemDetail')
        .noLoading()
        .param({
          activityId: EnterActivityDetailPageData?.activityInfo?.id,
          itemId: itemData.itemId,
          type: 'query',
        })
        .succ(res => {
          const { ret = {} } = res;
          let { item = {} } = ret;
          
          item.originItem = JSON.parse(JSON.stringify(item));
          subjectPromise?.then(subject => {
            item.currSubject = subject;
          });
          tkItemUtils?.getShowItemDetail(null, null, null, item);
          item.attrIsShow = options?.attrMarkSetting;
          
          // 标记
          questionTag?.value?.[item.id] && (questionTag.value[item.id].unreadUpdate = true);
          item.tag = questionTag?.value?.[item.id];
          
          // 按钮权限
          getButtonPermission?.(item);
          
          // 处理预组字段
          item.isGroup = !!item.preselectId;
          item.preGroupRemark = item.preselectRemark;
          
          const { struct, current, index } = getStructItemById?.(
            questions?.value,
            itemData.id
          );
          if (current) {
            questions?.value?.splice(index, 1);
            questions?.value?.splice(index, 0, item);
          }
          
          // 传递额外属性
          if (editingPaperStructure?.value?.hoverItemId == current?.id) {
            handleOnAttributeData?.({
              item: {
                attrIsShow: item.attrIsShow,
                itemTypeAttrs: item.expandAttrs,
                childItemTypeAttrs: item.childExpandAttrs,
                preGroupRemark: item.preselectRemark,
              },
            });
          }

          // 排序
          paperSort?.();
        })
        .send();
    },

    /**
     * 处理同步命题任务权限消息
     * @param {Object} data - 消息数据
     * @param {Object} context - 上下文数据
     */
    [SOCKET_MESSAGE_TYPES.SYNC_MT_TASK_PERMISSION]: async (data, context) => {
      const { options, questions, getButtonPermission } = context;
      
      await options?.refreshPermission?.();
      questions?.value?.forEach(item => {
        getButtonPermission?.(item);
      });
    },

    /**
     * 处理同步批注状态消息
     * @param {Object} data - 消息数据
     * @param {Object} context - 上下文数据
     */
    [SOCKET_MESSAGE_TYPES.SYNC_PAPER_COMMENT]: async (data, context) => {
      const { getStructItemById, questions, questionTag, editingPaperStructure, onChangeItemId } = context;
      const itemData = data.message;
      
      const { current } = getStructItemById?.(questions?.value, itemData.itemId);
      if (current && !current.tag?.unreadRemark) {
        // 标记
        questionTag?.value?.[itemData.itemId] && (questionTag.value[itemData.itemId].unreadRemark = true);
        current.tag = questionTag?.value?.[itemData.itemId];
        
        // 如果批注修改，需要重新刷新当前的批注
        if (editingPaperStructure?.value?.hoverItemId == current.id) {
          onChangeItemId?.({ id: current.id });
        }
      }
    },

    /**
     * 处理删除试题消息
     * @param {Object} data - 消息数据
     * @param {Object} context - 上下文数据
     */
    [SOCKET_MESSAGE_TYPES.DELETE_ITEM]: async (data, context) => {
      const { getStructItemById, questions, paperSort } = context;
      const itemData = data.message;
      
      const { current, index } = getStructItemById?.(questions?.value, itemData.id);
      if (current) {
        questions?.value?.splice(index, 1);
      }

      paperSort?.();
    },
  };

  /**
   * 合并默认处理器和自定义处理器
   */
  const messageHandlers = {
    ...defaultHandlers,
    ...handlers,
  };

  /**
   * 核心消息处理函数
   * 使用 switch 语句替代 if-else，提高可读性和性能
   * 
   * @param {Object} json - Socket消息数据
   */
  async function handleMessage(json) {
    try {
      const data = JSON.parse(json.data ?? '{}');
      const type = data.type;
      
      // 使用 switch 语句处理不同类型的消息
      switch (type) {
        case SOCKET_MESSAGE_TYPES.USER_JOIN:
        case SOCKET_MESSAGE_TYPES.USER_LEAVE:
          await messageHandlers[type]?.(data, context);
          break;
          
        case SOCKET_MESSAGE_TYPES.INSERT_STRUCT:
        case SOCKET_MESSAGE_TYPES.UPDATE_STRUCT:
        case SOCKET_MESSAGE_TYPES.DELETE_STRUCT:
        case SOCKET_MESSAGE_TYPES.UPDATE_STRUCT_AND_ITEM:
          await messageHandlers[type]?.(data, context);
          break;
          
        case SOCKET_MESSAGE_TYPES.LOCK_ITEM:
        case SOCKET_MESSAGE_TYPES.UNLOCK_ITEM:
          await messageHandlers[type]?.(data, context);
          break;
          
        case SOCKET_MESSAGE_TYPES.UPDATE_ITEM:
        case SOCKET_MESSAGE_TYPES.DELETE_ITEM:
          await messageHandlers[type]?.(data, context);
          break;
          
        case SOCKET_MESSAGE_TYPES.SYNC_MT_TASK_PERMISSION:
        case SOCKET_MESSAGE_TYPES.SYNC_PAPER_COMMENT:
          await messageHandlers[type]?.(data, context);
          break;
          
        default:
          // 处理未知消息类型
          console.warn(`未知的消息类型: ${type}`, data);
          break;
      }
    } catch (error) {
      console.error('消息处理失败:', error, json);
    }
  }

  /**
   * 注册 Socket 消息处理器
   * @param {Object} joinMessage - 进入页面时的消息配置
   */
  function registerMessageHandler(joinMessage = {}) {
    if (bussId) {
      tkSocket.setBussMessage(bussId, handleMessage, {
        type: SOCKET_MESSAGE_TYPES.USER_JOIN,
        title: '提示',
        message: `${tkSocket?.userInfo?.userName}老师进入页面`,
        ...joinMessage,
      });
    }
  }

  function sendBussMessage(message = {}) {
    if (bussId) {
      tkSocket.setBussMessage(bussId, handleMessage, message);
    }
  }

  /**
   * 添加自定义消息处理器
   * @param {string} messageType - 消息类型
   * @param {Function} handler - 处理器函数
   */
  function addMessageHandler(messageType, handler) {
    messageHandlers[messageType] = handler;
  }

  /**
   * 移除消息处理器
   * @param {string} messageType - 消息类型
   */
  function removeMessageHandler(messageType) {
    delete messageHandlers[messageType];
  }

  return {
    // 状态
    userLockItem,
    
    // 方法
    handleMessage,
    registerMessageHandler,
    addMessageHandler,
    removeMessageHandler,
    sendBussMessage,
    
    // 常量
    SOCKET_MESSAGE_TYPES,
  };
}

export default useSocketMessageHandler;
