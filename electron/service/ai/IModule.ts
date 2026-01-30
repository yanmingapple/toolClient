/**
 * AI模块接口（所有功能模块必须实现）
 */

/**
 * 模块信息
 */
export interface ModuleInfo {
  id: string;
  name: string;
  type: string;
  displayName: string;
  description: string;
  version: string;
}

/**
 * 用户行为
 */
export interface UserAction {
  type: string;  // 'create' | 'update' | 'delete' | 'view' | 'complete'
  category: string;  // 模块自定义分类
  data: any;  // 模块自定义数据
}

/**
 * 操作上下文
 */
export interface ActionContext {
  timestamp: string;
  sessionId?: string;
  device?: string;
  location?: string;
  previousAction?: UserAction;
}

/**
 * 建议上下文
 */
export interface SuggestionContext {
  userInput?: string;
  currentData?: any;
  historicalData?: any;
}

/**
 * 建议
 */
export interface Suggestion {
  type: string;  // 'time' | 'tag' | 'reminder' | 'action'
  content: string;
  confidence: number;
  data?: any;
}

/**
 * 用户反馈
 */
export interface UserFeedback {
  suggestionId: string;
  action: 'accepted' | 'rejected' | 'modified';
  modifiedData?: any;
}

/**
 * AI模块接口（所有功能模块必须实现）
 */
export interface IAIModule {
  // 模块信息
  getModuleInfo(): ModuleInfo;
  
  // 行为记录
  recordBehavior(action: UserAction, context: ActionContext): Promise<void>;
  
  // 偏好学习
  learnPreference(action: UserAction, context: ActionContext): Promise<void>;
  
  // 模式识别
  detectPattern(action: UserAction, context: ActionContext): Promise<void>;
  
  // 智能建议
  generateSuggestion(context: SuggestionContext): Promise<Suggestion[]>;
  
  // 反馈处理
  processFeedback(feedback: UserFeedback): Promise<void>;
}

