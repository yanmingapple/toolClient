import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import type { QueryHistory, QueryResult } from '../types/leftTree/connection'

const STORAGE_KEY = 'query-storage'

interface QueryTab {
  id: string
  connectionId: string
  title: string
  query: string
  active: boolean
  database?: string
}

const loadPersistedState = (): Partial<{ queryHistory: QueryHistory[] }> => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      if (parsed.queryHistory && Array.isArray(parsed.queryHistory)) {
        return { queryHistory: parsed.queryHistory }
      }
    }
  } catch (error) {
    console.error('Failed to load persisted state:', error)
  }
  return {}
}

const savePersistedState = (queryHistory: QueryHistory[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ queryHistory }))
  } catch (error) {
    console.error('Failed to save persisted state:', error)
  }
}

export const useQueryStore = defineStore('query', () => {
  const persistedState = loadPersistedState()
  const tabs = ref<QueryTab[]>([])
  const activeTabId = ref<string | null>(null)
  const queryResults = ref<Map<string, QueryResult>>(new Map())
  const queryHistory = ref<QueryHistory[]>(persistedState.queryHistory || [])
  const queryExecutionInProgress = ref(false)
  const currentQueryId = ref<string | null>(null)

  watch(queryHistory, (newHistory: QueryHistory[]) => {
    savePersistedState(newHistory)
  }, { deep: true })

  const activeTab = computed(() => {
    if (!activeTabId.value) return null
    return tabs.value.find((tab: QueryTab) => tab.id === activeTabId.value) || null
  })

  const activeTabQueryResult = computed(() => {
    if (!activeTabId.value) return null
    return queryResults.value.get(activeTabId.value) || null
  })

  const hasActiveTab = computed(() => activeTabId.value !== null)

  const addTab = (connectionId: string, query = '', title = 'New Query', database?: string): string => {
    const newTab: QueryTab = {
      id: `tab_${Date.now()}`,
      connectionId,
      title,
      query,
      active: true,
      database,
    }

    tabs.value = tabs.value.map((tab: QueryTab) => ({ ...tab, active: false }))
    tabs.value = [...tabs.value, newTab]
    activeTabId.value = newTab.id

    return newTab.id
  }

  const removeTab = (tabId: string) => {
    const updatedTabs = tabs.value.filter((tab: QueryTab) => tab.id !== tabId)
    let newActiveTabId = activeTabId.value

    if (activeTabId.value === tabId && updatedTabs.length > 0) {
      newActiveTabId = updatedTabs[updatedTabs.length - 1].id
      updatedTabs[updatedTabs.length - 1].active = true
    }

    const updatedQueryResults = new Map(queryResults.value)
    updatedQueryResults.delete(tabId)

    tabs.value = updatedTabs
    activeTabId.value = newActiveTabId
    queryResults.value = updatedQueryResults
  }

  const setActiveTab = (tabId: string) => {
    tabs.value = tabs.value.map((tab: QueryTab) => ({
      ...tab,
      active: tab.id === tabId,
    }))
    activeTabId.value = tabId
  }

  const updateQuery = (tabId: string, query: string) => {
    tabs.value = tabs.value.map((tab: QueryTab) =>
      tab.id === tabId ? { ...tab, query } : tab
    )
  }

  const updateTabTitle = (tabId: string, title: string) => {
    tabs.value = tabs.value.map((tab: QueryTab) =>
      tab.id === tabId ? { ...tab, title } : tab
    )
  }

  const setTabDatabase = (tabId: string, database: string) => {
    tabs.value = tabs.value.map((tab: QueryTab) =>
      tab.id === tabId ? { ...tab, database } : tab
    )
  }

  const executeQuery = async (_tabId: string, _query: string): Promise<QueryResult> => {
    const queryId = `query_${Date.now()}`
    setQueryExecutionStatus(true, queryId)

    await new Promise(resolve => setTimeout(resolve, 1000))

    const result: QueryResult = {
      columns: ['id', 'name', 'email', 'created_at'],
      rows: [
        { id: 1, name: 'John Doe', email: 'john@example.com', created_at: new Date() },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com', created_at: new Date() },
        { id: 3, name: 'Bob Johnson', email: 'bob@example.com', created_at: new Date() },
      ],
      affectedRows: 0,
      executionTime: 1000,
    }

    setQueryResult(_tabId, result)

    const tab = tabs.value.find((t: QueryTab) => t.id === _tabId)
    if (tab) {
      addToHistory({
        connectionId: tab.connectionId,
        database: tab.database,
        query: _query,
        executionTime: 1000,
      })
    }

    setQueryExecutionStatus(false)
    return result
  }

  const setQueryResult = (tabId: string, result: QueryResult) => {
    const updatedQueryResults = new Map(queryResults.value)
    updatedQueryResults.set(tabId, result)
    queryResults.value = updatedQueryResults
  }

  const clearQueryResult = (tabId: string) => {
    const updatedQueryResults = new Map(queryResults.value)
    updatedQueryResults.delete(tabId)
    queryResults.value = updatedQueryResults
  }

  const setQueryExecutionStatus = (inProgress: boolean, queryId?: string) => {
    queryExecutionInProgress.value = inProgress
    currentQueryId.value = queryId || null
  }

  const addToHistory = (history: Omit<QueryHistory, 'id' | 'executedAt'>) => {
    const newHistoryItem: QueryHistory = {
      ...history,
      id: `history_${Date.now()}`,
      executedAt: new Date(),
    }

    queryHistory.value = [newHistoryItem, ...queryHistory.value].slice(0, 1000)
  }

  const clearHistory = () => {
    queryHistory.value = []
  }

  const removeHistoryItem = (id: string) => {
    queryHistory.value = queryHistory.value.filter((item: QueryHistory) => item.id !== id)
  }

  const $reset = () => {
    tabs.value = []
    activeTabId.value = null
    queryResults.value = new Map()
    queryHistory.value = []
    queryExecutionInProgress.value = false
    currentQueryId.value = null
  }

  return {
    tabs,
    activeTabId,
    queryResults,
    queryHistory,
    queryExecutionInProgress,
    currentQueryId,
    activeTab,
    activeTabQueryResult,
    hasActiveTab,
    addTab,
    removeTab,
    setActiveTab,
    updateQuery,
    updateTabTitle,
    setTabDatabase,
    executeQuery,
    setQueryResult,
    clearQueryResult,
    setQueryExecutionStatus,
    addToHistory,
    clearHistory,
    removeHistoryItem,
    $reset
  }
})
