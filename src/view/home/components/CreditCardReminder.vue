<template>
  <div class="credit-card-reminder">
    <el-drawer
      v-model="visible"
      direction="rtl"
      size="100vw"
      :close-on-click-modal="false"
      class="credit-card-reminder-drawer"
      :fullscreen="true"
      :show-close="false"
    >
      <template #header>
        <div class="dialog-title">
          <div class="title-wrapper">
            <el-icon class="title-icon"><CreditCard /></el-icon>
            <span class="title-text">信用卡管理</span>
          </div>
          <div class="calendar-nav">
            <el-button type="success" size="small" @click="handleCheckAll">
              <el-icon><Check /></el-icon>
              检查所有账单
            </el-button>
            <el-button type="primary" size="small" @click="handleAddCard">
              <el-icon><Plus /></el-icon>
              添加信用卡
            </el-button>
            <el-button type="danger" size="small" @click="handleClose" class="close-btn">
              <el-icon><Close /></el-icon>
              关闭
            </el-button>
          </div>
        </div>
      </template>

    <!-- 统计信息区域 -->
    <div class="stats-section">
      <div class="stat-card">
        <div class="stat-icon-wrapper">
          <el-icon class="stat-icon"><CreditCard /></el-icon>
        </div>
        <div class="stat-info">
          <div class="stat-label">总卡数</div>
          <div class="stat-value">{{ creditCards.length }}</div>
        </div>
      </div>
      <div class="stat-card warning">
        <div class="stat-icon-wrapper">
          <el-icon class="stat-icon"><Warning /></el-icon>
        </div>
        <div class="stat-info">
          <div class="stat-label">即将到期</div>
          <div class="stat-value">{{ upcomingCards.length }}</div>
        </div>
      </div>
      <div class="stat-card danger">
        <div class="stat-icon-wrapper">
          <el-icon class="stat-icon"><Clock /></el-icon>
        </div>
        <div class="stat-info">
          <div class="stat-label">已逾期</div>
          <div class="stat-value">{{ overdueCards.length }}</div>
        </div>
      </div>
      <div class="stat-card total">
        <div class="stat-icon-wrapper">
          <el-icon class="stat-icon"><Money /></el-icon>
        </div>
        <div class="stat-info">
          <div class="stat-label">总信用额度</div>
          <div class="stat-value">¥{{ formatAmount(totalCreditLimit) }}</div>
        </div>
      </div>
    </div>

    <!-- 信用卡列表区域 -->
    <div class="content-wrapper">
      <div class="card-list" v-if="creditCards.length > 0">
        <div
          v-for="card in creditCards"
          :key="card.id"
          class="card-item"
          :class="getCardStatusClass(card)"
        >
          <!-- 卡片头部 -->
          <div class="card-header">
            <div class="card-brand-wrapper">
              <div class="card-badge" :class="card.cardType">
                {{ getCardTypeText(card.cardType) }}
              </div>
              <div class="card-brand">{{ card.bankName }}</div>
            </div>
            <div class="card-number">**** **** **** {{ card.lastFourDigits }}</div>
          </div>

          <!-- 卡片主体信息 -->
          <div class="card-body">
            <div class="card-info-grid">
              <div class="info-row">
                <div class="info-item">
                  <span class="info-label">账单日</span>
                  <span class="info-value highlight">{{ card.billingDay }}号</span>
                </div>
                <div class="info-item">
                  <span class="info-label">还款日</span>
                  <span class="info-value highlight">{{ card.dueDay }}号</span>
                </div>
              </div>
              <div class="info-row">
                <div class="info-item">
                  <span class="info-label">信用额度</span>
                  <span class="info-value">¥{{ formatAmount(card.creditLimit) }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">当前余额</span>
                  <span class="info-value">¥{{ formatAmount(card.currentBalance) }}</span>
                </div>
              </div>
              <div class="info-row">
                <div class="info-item">
                  <span class="info-label">可用额度</span>
                  <span class="info-value success">¥{{ formatAmount(card.creditLimit - card.currentBalance) }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">使用率</span>
                  <span class="info-value">{{ getUsageRate(card) }}%</span>
                </div>
              </div>
            </div>

            <!-- 状态和操作区域 -->
            <div class="card-footer">
              <div class="status-section">
                <el-tag :type="getDueStatusType(card)" size="small">
                  {{ getDueStatusText(card) }}
                </el-tag>
                <span class="days-left">{{ getDaysLeft(card) }}</span>
              </div>
              <div class="card-actions">
                <el-button type="primary" link @click="handleEditCard(card)">
                  <el-icon><Edit /></el-icon>
                  编辑
                </el-button>
                <el-button type="danger" link @click="handleDeleteCard(card.id)">
                  <el-icon><Delete /></el-icon>
                  删除
                </el-button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div class="empty-state" v-else>
        <el-empty description="暂无信用卡数据">
          <el-button type="primary" @click="handleAddCard">添加第一张信用卡</el-button>
        </el-empty>
      </div>
    </div>

    <!-- 添加/编辑信用卡抽屉 -->
    <el-drawer
      v-model="addCardVisible"
      :title="editingCard ? '编辑信用卡' : '添加信用卡'"
      size="600px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="cardFormRef"
        :model="formData"
        :rules="rules"
        label-width="100px"
        class="card-form"
      >
        <el-form-item label="银行名称" prop="bankName">
          <el-input v-model="formData.bankName" placeholder="请输入银行名称" />
        </el-form-item>
        <el-form-item label="卡种" prop="cardType">
          <el-select v-model="formData.cardType" placeholder="请选择卡种">
            <el-option label="银联" value="unionpay" />
            <el-option label="Visa" value="visa" />
            <el-option label="Mastercard" value="mastercard" />
            <el-option label="JCB" value="jcb" />
          </el-select>
        </el-form-item>
        <el-form-item label="卡号后四位" prop="lastFourDigits">
          <el-input v-model="formData.lastFourDigits" placeholder="请输入卡号后四位" maxlength="4" />
        </el-form-item>
        <el-form-item label="账单日" prop="billingDay">
          <el-input-number v-model="formData.billingDay" :min="1" :max="31" />
        </el-form-item>
        <el-form-item label="还款日" prop="dueDay">
          <el-input-number v-model="formData.dueDay" :min="1" :max="31" />
        </el-form-item>
        <el-form-item label="信用额度(元)" prop="creditLimit">
          <el-input-number v-model="formData.creditLimit" :min="0" :step="1000" />
        </el-form-item>
        <el-form-item label="当前余额(元)" prop="currentBalance">
          <el-input-number v-model="formData.currentBalance" :min="0" :step="100" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="addCardVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSaveCard">保存</el-button>
      </template>
    </el-drawer>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Check, Warning, Clock, CreditCard, Edit, Delete, Close, Money } from '@element-plus/icons-vue'

interface CreditCard {
  id: string
  bankName: string
  cardType: 'unionpay' | 'visa' | 'mastercard' | 'jcb'
  lastFourDigits: string
  billingDay: number
  dueDay: number
  creditLimit: number
  currentBalance: number
  createdAt: number
}

interface FormData {
  bankName: string
  cardType: string
  lastFourDigits: string
  billingDay: number
  dueDay: number
  creditLimit: number
  currentBalance: number
}

const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const creditCards = ref<CreditCard[]>([])
const addCardVisible = ref(false)
const editingCard = ref<CreditCard | null>(null)
const cardFormRef = ref()

const formData = ref<FormData>({
  bankName: '',
  cardType: 'unionpay',
  lastFourDigits: '',
  billingDay: 1,
  dueDay: 20,
  creditLimit: 50000,
  currentBalance: 0
})

const rules = {
  bankName: [{ required: true, message: '请输入银行名称', trigger: 'blur' }],
  cardType: [{ required: true, message: '请选择卡种', trigger: 'change' }],
  lastFourDigits: [
    { required: true, message: '请输入卡号后四位', trigger: 'blur' },
    { pattern: /^\d{4}$/, message: '请输入有效的四位数字', trigger: 'blur' }
  ],
  billingDay: [{ required: true, message: '请输入账单日', trigger: 'blur' }],
  dueDay: [{ required: true, message: '请输入还款日', trigger: 'blur' }],
  creditLimit: [{ required: true, message: '请输入信用额度', trigger: 'blur' }]
}

const upcomingCards = computed(() => {
  return creditCards.value.filter(card => getDaysUntilDue(card) > 0 && getDaysUntilDue(card) <= 3)
})

const overdueCards = computed(() => {
  return creditCards.value.filter(card => getDaysUntilDue(card) < 0)
})

const totalCreditLimit = computed(() => {
  return creditCards.value.reduce((sum, card) => sum + card.creditLimit, 0)
})

const getCardTypeText = (cardType: string): string => {
  const typeMap: Record<string, string> = {
    unionpay: '银联',
    visa: 'Visa',
    mastercard: 'Mastercard',
    jcb: 'JCB'
  }
  return typeMap[cardType] || cardType
}

const getUsageRate = (card: CreditCard): string => {
  if (card.creditLimit === 0) return '0'
  return Math.round((card.currentBalance / card.creditLimit) * 100).toString()
}

const handleClose = () => {
  visible.value = false
  // 发送事件通知父组件切换回工具面板
  emit('close')
}

const formatAmount = (amount: number): string => {
  return amount.toLocaleString('zh-CN')
}

const getDaysUntilDue = (card: CreditCard): number => {
  const today = new Date()
  const currentMonth = today.getMonth()
  const currentYear = today.getFullYear()
  const currentDay = today.getDate()

  let dueDate = new Date(currentYear, currentMonth, card.dueDay)
  
  if (dueDate < today) {
    dueDate = new Date(currentYear, currentMonth + 1, card.dueDay)
  }

  const diffTime = dueDate.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  return diffDays
}

const getDaysLeft = (card: CreditCard): string => {
  const days = getDaysUntilDue(card)
  if (days < 0) {
    return `已逾期 ${Math.abs(days)} 天`
  } else if (days === 0) {
    return '今天到期'
  } else {
    return `剩余 ${days} 天`
  }
}

const getDueStatusType = (card: CreditCard): string => {
  const days = getDaysUntilDue(card)
  if (days < 0) return 'danger'
  if (days <= 3) return 'warning'
  return 'success'
}

const getDueStatusText = (card: CreditCard): string => {
  const days = getDaysUntilDue(card)
  if (days < 0) return '已逾期'
  if (days <= 3) return '即将到期'
  return '正常'
}

const getCardStatusClass = (card: CreditCard): string => {
  const days = getDaysUntilDue(card)
  if (days < 0) return 'overdue'
  if (days <= 3) return 'warning'
  return ''
}

const handleAddCard = () => {
  editingCard.value = null
  formData.value = {
    bankName: '',
    cardType: 'unionpay',
    lastFourDigits: '',
    billingDay: 1,
    dueDay: 20,
    creditLimit: 50000,
    currentBalance: 0
  }
  addCardVisible.value = true
}

const handleEditCard = (card: CreditCard) => {
  editingCard.value = card
  formData.value = {
    bankName: card.bankName,
    cardType: card.cardType,
    lastFourDigits: card.lastFourDigits,
    billingDay: card.billingDay,
    dueDay: card.dueDay,
    creditLimit: card.creditLimit,
    currentBalance: card.currentBalance
  }
  addCardVisible.value = true
}

const handleSaveCard = async () => {
  await cardFormRef.value?.validate().then(async () => {
    if (editingCard.value) {
      // 编辑模式
      const index = creditCards.value.findIndex(c => c.id === editingCard.value!.id)
      if (index !== -1) {
        creditCards.value[index] = {
          ...editingCard.value,
          ...formData.value
        }
        ElMessage.success('信用卡信息已更新')
      }
    } else {
      // 添加模式
      const newCard: CreditCard = {
        id: Date.now().toString(),
        ...formData.value,
        createdAt: Date.now()
      }
      creditCards.value.push(newCard)
      ElMessage.success('信用卡已添加')
    }
    
    addCardVisible.value = false
    await saveCardsToStorage()
  }).catch(() => {
    // Validation failed
  })
}

const handleDeleteCard = async (id: string) => {
  try {
    await ElMessageBox.confirm('确定要删除这张信用卡吗？', '提示', {
      type: 'warning'
    })
    
    const index = creditCards.value.findIndex(c => c.id === id)
    if (index !== -1) {
      creditCards.value.splice(index, 1)
      ElMessage.success('信用卡已删除')
      await saveCardsToStorage()
    }
  } catch {
    // User cancelled
  }
}

const handleCheckAll = () => {
  ElMessage.info('已检查所有账单状态')
}

const saveCardsToStorage = async () => {
  try {
    localStorage.setItem('creditCards', JSON.stringify(creditCards.value))
  } catch (error) {
    console.error('Failed to save credit cards:', error)
    ElMessage.error('保存失败')
  }
}

const loadCardsFromStorage = () => {
  try {
    const saved = localStorage.getItem('creditCards')
    if (saved) {
      creditCards.value = JSON.parse(saved)
    }
  } catch (error) {
    console.error('Failed to load credit cards:', error)
  }
}

onMounted(() => {
  loadCardsFromStorage()
})
</script>

<style lang="scss" scoped>
.credit-card-reminder {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  overflow: hidden;
}

/* 抽屉样式 */
.credit-card-reminder-drawer {
  .el-drawer__header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    padding: 16px 20px;
    border-bottom: none;
  }
  
  .close-btn {
    margin-left: 10px;
    
    &:hover {
      transform: scale(1.05);
    }
  }
}

/* Dialog Title */
.dialog-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 12px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px 12px 0 0;
  margin: -12px -12px 0 -12px;
}

.title-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
}

.title-icon {
  font-size: 24px;
  color: white;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
}

.title-text {
  font-size: 20px;
  font-weight: 700;
  color: white;
  letter-spacing: 1px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.calendar-nav {
  display: flex;
  align-items: center;
  gap: 8px;
}

// 统计信息区域
.stats-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  padding: 32px;
  padding-bottom: 20px;

  .stat-card {
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    border-radius: 16px;
    padding: 24px;
    display: flex;
    align-items: center;
    gap: 20px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
    border: 1px solid rgba(255, 255, 255, 0.2);

    &:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
    }

    &.warning {
      background: linear-gradient(135deg, #fff9e6 0%, #fff3cd 100%);
      border-color: #ffc107;

      .stat-icon-wrapper {
        background: rgba(255, 193, 7, 0.2);

        .stat-icon {
          color: #ffc107;
        }
      }
    }

    &.danger {
      background: linear-gradient(135deg, #ffe6e6 0%, #f8d7da 100%);
      border-color: #dc3545;

      .stat-icon-wrapper {
        background: rgba(220, 53, 69, 0.2);

        .stat-icon {
          color: #dc3545;
        }
      }
    }

    &.total {
      background: linear-gradient(135deg, #e6f7ff 0%, #bae7ff 100%);
      border-color: #1890ff;

      .stat-icon-wrapper {
        background: rgba(24, 144, 255, 0.2);

        .stat-icon {
          color: #1890ff;
        }
      }
    }

    .stat-icon-wrapper {
      width: 60px;
      height: 60px;
      border-radius: 16px;
      background: rgba(102, 126, 234, 0.15);
      display: flex;
      align-items: center;
      justify-content: center;

      .stat-icon {
        font-size: 28px;
        color: #667eea;
      }
    }

    .stat-info {
      flex: 1;

      .stat-label {
        font-size: 14px;
        color: #999;
        margin-bottom: 4px;
        font-weight: 500;
      }

      .stat-value {
        font-size: 32px;
        font-weight: 700;
        color: #333;
      }
    }
  }
}

  // 内容区域
  .content-wrapper {
    flex: 1;
    overflow-y: auto;
    padding: 0 32px 32px;

    &::-webkit-scrollbar {
      width: 8px;
    }

    &::-webkit-scrollbar-track {
      background: rgba(255, 255, 255, 0.1);
      border-radius: 4px;
    }

    &::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.3);
      border-radius: 4px;

      &:hover {
        background: rgba(255, 255, 255, 0.5);
      }
    }

    // 卡片列表
    .card-list {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
      gap: 24px;
    }

    // 空状态
    .empty-state {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100%;
      min-height: 400px;

      :deep(.el-empty) {
        background: rgba(255, 255, 255, 0.95);
        padding: 60px;
        border-radius: 16px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
      }
    }
  }

  // 信用卡卡片
  .card-item {
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    border-radius: 16px;
    padding: 24px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
    border: 2px solid transparent;

    &:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
    }

    &.warning {
      border-color: #ffc107;
      background: linear-gradient(135deg, #fff9e6 0%, #fff3cd 100%);
    }

    &.overdue {
      border-color: #dc3545;
      background: linear-gradient(135deg, #ffe6e6 0%, #f8d7da 100%);
    }

    // 卡片头部
    .card-header {
      margin-bottom: 20px;

      .card-brand-wrapper {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 8px;

        .card-badge {
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;

          &.unionpay {
            background: #009688;
            color: white;
          }

          &.visa {
            background: #1a1f71;
            color: white;
          }

          &.mastercard {
            background: #eb001b;
            color: white;
          }

          &.jcb {
            background: #003399;
            color: white;
          }
        }

        .card-brand {
          font-size: 20px;
          font-weight: 700;
          color: #333;
        }
      }

      .card-number {
        font-family: 'Courier New', monospace;
        font-size: 16px;
        color: #666;
        letter-spacing: 2px;
      }
    }

    // 卡片主体
    .card-body {
      .card-info-grid {
        display: flex;
        flex-direction: column;
        gap: 16px;

        .info-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;

          .info-item {
            display: flex;
            flex-direction: column;
            gap: 4px;

            .info-label {
              font-size: 13px;
              color: #999;
              font-weight: 500;
            }

            .info-value {
              font-size: 16px;
              font-weight: 600;
              color: #333;

              &.highlight {
                color: #667eea;
                font-size: 18px;
              }

              &.success {
                color: #52c41a;
              }
            }
          }
        }
      }
    }

    // 卡片底部
    .card-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 20px;
      padding-top: 20px;
      border-top: 1px solid rgba(0, 0, 0, 0.1);

      .status-section {
        display: flex;
        align-items: center;
        gap: 12px;

        .days-left {
          font-size: 14px;
          color: #666;
          font-weight: 500;
        }
      }

      .card-actions {
        display: flex;
        gap: 8px;
      }
    }
  }

  // 表单样式
  .card-form {
    padding: 20px 0;
  }


// 响应式设计
@media (max-width: 1200px) {
  .credit-card-reminder {
    .content-wrapper {
      .card-list {
        grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      }
    }
  }
}

@media (max-width: 768px) {
  .credit-card-reminder {
    .header {
      padding: 12px 16px;
      flex-direction: column;
      gap: 12px;
      align-items: flex-start;

      .header-left {
        .title {
          font-size: 20px;
        }
      }

      .header-right {
        width: 100%;
        justify-content: space-between;
      }
    }

    .stats-section {
      grid-template-columns: repeat(2, 1fr);
      padding: 20px 16px;
      gap: 12px;

      .stat-card {
        padding: 16px;
        gap: 12px;

        .stat-icon-wrapper {
          width: 48px;
          height: 48px;

          .stat-icon {
            font-size: 22px;
          }
        }

        .stat-info {
          .stat-value {
            font-size: 24px;
          }
        }
      }
    }

    .content-wrapper {
      padding: 0 16px 16px;

      .card-list {
        grid-template-columns: 1fr;
        gap: 16px;
      }
    }

    .card-item {
      padding: 16px;

      .card-header {
        .card-brand-wrapper {
          .card-brand {
            font-size: 18px;
          }
        }
      }

      .card-body {
        .card-info-grid {
          .info-row {
            grid-template-columns: 1fr;
            gap: 12px;
          }
        }
      }
    }
  }
}
</style>
