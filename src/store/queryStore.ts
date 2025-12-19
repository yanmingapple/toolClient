import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { QueryHistory, QueryResult } from '../types/connection'

interface QueryTab {
  id: string;
  connectionId: string;
  title: string;
  query: string;
  active: boolean;
  database?: string;
}

interface QueryStore {
  tabs: QueryTab[];
  activeTabId: string | null;
  queryResults: Map<string, QueryResult>;
  queryHistory: QueryHistory[];
  queryExecutionInProgress: boolean;
  currentQueryId: string | null;

  // Tab actions
  addTab: (connectionId: string, query?: string, title?: string, database?: string) => string;
  removeTab: (tabId: string) => void;
  setActiveTab: (tabId: string) => void;
  updateQuery: (tabId: string, query: string) => void;
  updateTabTitle: (tabId: string, title: string) => void;
  setTabDatabase: (tabId: string, database: string) => void;

  // Query actions
  executeQuery: (tabId: string, query: string) => Promise<QueryResult>;
  setQueryResult: (tabId: string, result: QueryResult) => void;
  clearQueryResult: (tabId: string) => void;
  setQueryExecutionStatus: (inProgress: boolean, queryId?: string) => void;

  // History actions
  addToHistory: (history: Omit<QueryHistory, 'id' | 'executedAt'>) => void;
  clearHistory: () => void;
  removeHistoryItem: (id: string) => void;
}

export const useQueryStore = create<QueryStore>()(
  persist(
    (set, get) => ({
      tabs: [],
      activeTabId: null,
      queryResults: new Map(),
      queryHistory: [],
      queryExecutionInProgress: false,
      currentQueryId: null,

      addTab: (connectionId, query = '', title = 'New Query', database) => {
        const newTab: QueryTab = {
          id: `tab_${Date.now()}`,
          connectionId,
          title,
          query,
          active: true,
          database,
        }

        set((state) => {
          // Deactivate all existing tabs
          const updatedTabs = state.tabs.map((tab) => ({ ...tab, active: false }))
          return {
            tabs: [...updatedTabs, newTab],
            activeTabId: newTab.id,
          }
        })

        return newTab.id
      },

      removeTab: (tabId) => {
        set((state) => {
          const updatedTabs = state.tabs.filter((tab) => tab.id !== tabId)
          let newActiveTabId = state.activeTabId

          if (state.activeTabId === tabId && updatedTabs.length > 0) {
            newActiveTabId = updatedTabs[updatedTabs.length - 1].id
            updatedTabs[updatedTabs.length - 1].active = true
          }

          // Clear query result for this tab
          const updatedQueryResults = new Map(state.queryResults)
          updatedQueryResults.delete(tabId)

          return {
            tabs: updatedTabs,
            activeTabId: newActiveTabId,
            queryResults: updatedQueryResults,
          }
        })
      },

      setActiveTab: (tabId) => {
        set((state) => {
          const updatedTabs = state.tabs.map((tab) => ({
            ...tab,
            active: tab.id === tabId,
          }))
          return {
            tabs: updatedTabs,
            activeTabId: tabId,
          }
        })
      },

      updateQuery: (tabId, query) => {
        set((state) => ({
          tabs: state.tabs.map((tab) =>
            tab.id === tabId ? { ...tab, query } : tab
          ),
        }))
      },

      updateTabTitle: (tabId, title) => {
        set((state) => ({
          tabs: state.tabs.map((tab) =>
            tab.id === tabId ? { ...tab, title } : tab
          ),
        }))
      },

      setTabDatabase: (tabId, database) => {
        set((state) => ({
          tabs: state.tabs.map((tab) =>
            tab.id === tabId ? { ...tab, database } : tab
          ),
        }))
      },

      executeQuery: async (tabId, query) => {
        try {
          const queryId = `query_${Date.now()}`
          get().setQueryExecutionStatus(true, queryId)

          // Simulate query execution delay
          await new Promise((resolve) => setTimeout(resolve, 1000))

          // This is a placeholder - in real app, we'd execute the query against the database
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

          get().setQueryResult(tabId, result)

          // Add to history
          const tab = get().tabs.find((t) => t.id === tabId)
          if (tab) {
            get().addToHistory({
              connectionId: tab.connectionId,
              database: tab.database,
              query,
              executionTime: 1000,
            })
          }

          get().setQueryExecutionStatus(false)
          return result
        } catch (error) {
          console.error('Query execution failed:', error)
          get().setQueryExecutionStatus(false)
          throw error
        }
      },

      setQueryResult: (tabId, result) => {
        set((state) => {
          const updatedQueryResults = new Map(state.queryResults)
          updatedQueryResults.set(tabId, result)
          return { queryResults: updatedQueryResults }
        })
      },

      clearQueryResult: (tabId) => {
        set((state) => {
          const updatedQueryResults = new Map(state.queryResults)
          updatedQueryResults.delete(tabId)
          return { queryResults: updatedQueryResults }
        })
      },

      setQueryExecutionStatus: (inProgress, queryId) => {
        set({ queryExecutionInProgress: inProgress, currentQueryId: queryId })
      },

      addToHistory: (history) => {
        const newHistoryItem: QueryHistory = {
          ...history,
          id: `history_${Date.now()}`,
          executedAt: new Date(),
        }

        set((state) => ({
          queryHistory: [newHistoryItem, ...state.queryHistory].slice(0, 1000), // Keep last 1000 queries
        }))
      },

      clearHistory: () => {
        set({ queryHistory: [] })
      },

      removeHistoryItem: (id) => {
        set((state) => ({
          queryHistory: state.queryHistory.filter((item) => item.id !== id),
        }))
      },
    }),
    {
      name: 'query-storage',
      partialize: (state) => ({
        queryHistory: state.queryHistory,
      }),
      serialize: (state) => {
        return JSON.stringify({
          ...state,
        })
      },
      deserialize: (str) => {
        return JSON.parse(str)
      },
    }
  )
)