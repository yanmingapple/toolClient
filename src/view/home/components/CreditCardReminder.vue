<template>
  <div class="credit-card-reminder">
    <el-dialog
      v-model="visible"
      width="900px"
      title="信用卡管理"
      :close-on-click-modal="false"
      class="credit-card-dialog"
    >
      <div class="credit-card-content">
        <!-- 工具栏 -->
        <div class="toolbar">
          <el-button type="primary" @click="handleAddCard">
            <el-icon><Plus /></el-icon>
            添加信用卡
          </el-button>
          <el-button type="success" @click="handleCheckAll">
            <el-icon><Check /></el-icon>
            检查所有账单
          </el-button>
        </div>

        <!-- 统计信息 -->
        <div class="stats-section">
          <el-card class="stat-card">
            <div class="stat-item">
              <el-icon class="stat-icon"><CreditCard /></el-icon>
              <div class="stat-info">
                <div class="stat-label">总卡数</div>
                <div class="stat-value">{{ creditCards.length }}</div>
              </div>
            </div>
          </el-card>
          <el-card class="stat-card warning">
            <div class="stat-item">
              <el-icon class="stat-icon"><Warning /></el-icon>
              <div class="stat-info">
                <div class="stat-label">即将到期</div>
                <div class="stat-value">{{ upcomingCards.length }}</div>
              </div>
            </div>
          </el-card>
          <el-card class="stat-card danger">
            <div class="stat-item">
              <el-icon class="stat-icon"><Clock /></el-icon>
              <div class="stat-info">
                <div class="stat-label">已逾期</div>
                <div class="stat-value">{{ overdueCards.length }}</div>
              </div>
            </div>
          </el-card>
        </div>

        <!-- 信用卡列表 -->
        <div class="card-list">
          <div
            v-for="card in creditCards"
            :key="card.id"
            class="card-item"
            :class="getCardStatusClass(card)"
          >
            <div class="card-header">
              <div class="card-brand">{{ card.bankName }}</div>
              <div class="card-number">**** **** **** {{ card.lastFourDigits }}</div>
            </div>
            <div class="card-body">
              <div class="card-info">
                <div class="info-item">
                  <span class="info-label">账单日:</span>
                  <span class="info-value">{{ card.billingDay }}号</span>
                </div>
                <div class="info-item">
                  <span class="info-label">还款日:</span>
                  <span class="info-value">{{ card.dueDay }}号</span>
                </div>
                <div class="info-item">
                  <span class="info-label">信用额度:</span>
                  <span class="info-value">¥{{ formatAmount(card.creditLimit) }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">当前余额:</span>
                  <span class="info-value">¥{{ formatAmount(card.currentBalance) }}</span>
                </div>
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
            <div class="card-footer">
              <el-tag :type="getDueStatusType(card)" size="small">
                {{ getDueStatusText(card) }}
              </el-tag>
              <span class="days-left">{{ getDaysLeft(card) }}</span>
            </div>
          </div>
        </div>

        <el-empty v-if="creditCards.length === 0" description="暂无信用卡">
          <el-button type="primary" @click="handleAddCard">添加第一张信用卡</el-button>
        </el-empty>
      </div>
    </el-dialog>

    <!-- 添加/编辑信用卡对话框 -->
    <el-dialog
      v-model="addCardVisible"
      width="600px"
      :title="editingCard ? '编辑信用卡' : '添加信用卡'"
    >
      <el-form
        ref="cardFormRef"
        :model="formData"
        :rules="rules"
        label-width="100px"
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
        <el-form-item label="后四位" prop="lastFourDigits">
          <el-input v-model="formData.lastFourDigits" placeholder="请输入卡号后四位" maxlength="4" />
        </el-form-item>
        <el-form-item label="账单日" prop="billingDay">
          <el-input-number v-model="formData.billingDay" :min="1" :max="31" />
        </el-form-item>
        <el-form-item label="还款日" prop="dueDay">
          <el-input-number v-model="formData.dueDay" :min="1" :max="31" />
        </el-form-item>
        <el-form-item label="信用额度" prop="creditLimit">
          <el-input-number v-model="formData.creditLimit" :min="0" :step="1000" />
        </el-form-item>
        <el-form-item label="当前余额" prop="currentBalance">
          <el-input-number v-model="formData.currentBalance" :min="0" :step="100" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="addCardVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSaveCard">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Check, Warning, Clock, CreditCard, Edit, Delete } from '@element-plus/icons-vue'

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
  .credit-card-dialog {
    .credit-card-content {
      .toolbar {
        margin-bottom: 20px;
        display: flex;
        gap: 10px;
      }

      .stats-section {
        display: flex;
        gap: 16px;
        margin-bottom: 20px;

        .stat-card {
          flex: 1;
          .stat-item {
            display: flex;
            align-items: center;
            gap: 12px;

            .stat-icon {
              font-size: 32px;
              color: #409eff;
            }

            &.warning .stat-icon {
              color: #e6a23c;
            }

            &.danger .stat-icon {
              color: #f56c6c;
            }

            .stat-info {
              .stat-label {
                font-size: 14px;
                color: #909399;
              }

              .stat-value {
                font-size: 24px;
                font-weight: bold;
                color: #303133;
              }
            }
          }

          &.warning {
            border-color: #e6a23c;
            .stat-item {
              .stat-icon {
                color: #e6a23c;
              }
            }
          }

          &.danger {
            border-color: #f56c6c;
            .stat-item {
              .stat-icon {
                color: #f56c6c;
              }
            }
          }
        }
      }

      .card-list {
        display: flex;
        flex-direction: column;
        gap: 16px;

        .card-item {
          border: 1px solid #e4e7ed;
          border-radius: 8px;
          padding: 16px;
          transition: all 0.3s;

          &:hover {
            box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
          }

          &.warning {
            border-color: #e6a23c;
            background-color: #fdf6ec;
          }

          &.overdue {
            border-color: #f56c6c;
            background-color: #fef0f0;
          }

          .card-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 12px;

            .card-brand {
              font-size: 18px;
              font-weight: bold;
              color: #303133;
            }

            .card-number {
              font-family: 'Courier New', monospace;
              color: #606266;
            }
          }

          .card-body {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;

            .card-info {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 12px;

              .info-item {
                display: flex;
                gap: 8px;

                .info-label {
                  color: #909399;
                  font-size: 14px;
                }

                .info-value {
                  color: #303133;
                  font-weight: 500;
                }
              }
            }

            .card-actions {
              display: flex;
              gap: 8px;
            }
          }

          .card-footer {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-top: 12px;
            padding-top: 12px;
            border-top: 1px solid #e4e7ed;

            .days-left {
              font-size: 14px;
              color: #606266;
            }
          }
        }
      }
    }
  }
}
</style>