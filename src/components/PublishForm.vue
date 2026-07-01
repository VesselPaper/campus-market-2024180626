<script setup lang="ts">
import { reactive, computed, ref, onUnmounted } from 'vue'
import { ElForm, ElFormItem, ElInput, ElSelect, ElOption, ElButton, ElMessage, ElRadioGroup, ElRadio, ElInputNumber, ElTag, ElIcon } from 'element-plus'
import { ITEM_TYPES, CAMPUS_LIST, API_BASE_URL, imageUrl } from '@/utils/constants'
import type { ItemType, Item } from '@/types'
import { now } from '@/utils/date'

const emit = defineEmits<{
  submit: [data: Partial<Item>]
}>()

const formRef = ref<InstanceType<typeof ElForm>>()

const form = reactive({
  type: 'secondhand' as ItemType,
  title: '',
  description: '',
  campus: '',
  location: '',
  tags: '',
  images: [] as string[],
  // secondhand
  price: undefined as number | undefined,
  condition: '',
  // lostfound
  lostOrFound: 'lost',
  eventTime: '',
  itemFeature: '',
  // group
  targetCount: 2,
  deadline: '',
  // errand
  reward: undefined as number | undefined,
  taskPlace: '',
  expectedTime: '',
})

const typeLabel = computed(() => ITEM_TYPES.find(t => t.value === form.type)?.label || '')

const imagePreviewList = computed(() => form.images)

const uploading = ref(false)
const uploadKey = ref(0)
const uploadedUrls = ref<string[]>([])   // 本次上传的图片 URL 列表
let submitted = false                    // 是否已提交发布

async function handleFileSelect(e: Event) {
  const files = (e.target as HTMLInputElement).files
  if (!files) return
  uploading.value = true
  try {
    for (const file of files) {
      // 只允许 JPG/JPEG 格式（检查 MIME 类型和扩展名）
      const isJPG = file.type === 'image/jpeg' || /\.jpe?g$/i.test(file.name)
      if (!isJPG) {
        ElMessage.warning(`"${file.name}" 不是 JPG 格式，已跳过`)
        continue
      }
      // 先把图片转 base64
      const base64 = await fileToBase64(file)
      // 上传到服务器
      const url = await uploadImage(base64)
      form.images.push(url)
      uploadedUrls.value.push(url)    // 记录已上传的图片，退出时清理
    }
    if (form.images.length > 0) {
      ElMessage.success(`已上传 ${form.images.length} 张图片`)
    }
  } catch (err) {
    console.error('上传失败:', err)
    ElMessage.error('部分图片上传失败，请重试')
  } finally {
    uploading.value = false
    // 重新创建 input 元素，确保下次 change 事件正常触发
    uploadKey.value++
  }
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      if (reader.result && typeof reader.result === 'string') {
        resolve(reader.result)
      } else {
        reject(new Error('读取图片失败'))
      }
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

async function uploadImage(base64: string): Promise<string> {
  const res = await fetch(`${API_BASE_URL}/api/upload`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ image: base64 }),
  })
  if (!res.ok) throw new Error('上传图片失败')
  const data = await res.json()
  return data.url
}

// 退出页面时清理未提交的图片
onUnmounted(() => {
  if (!submitted && uploadedUrls.value.length > 0) {
    fetch(`${API_BASE_URL}/api/cleanup-uploads`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ urls: uploadedUrls.value }),
    }).catch(() => {})
  }
})

function removeImage(idx: number) {
  form.images.splice(idx, 1)
}

function buildSubmitData(): Partial<Item> {
  const tags = form.tags
    ? form.tags.split(/[,，、]/).map(s => s.trim()).filter(Boolean)
    : []

  const base = {
    type: form.type,
    title: form.title,
    description: form.description,
    campus: form.campus,
    location: form.location,
    tags,
    images: form.images,
    status: '进行中',
    viewCount: 0,
    favoriteCount: 0,
    createdAt: now(),
    updatedAt: now(),
  }

  const extra: Partial<Item> = {}

  if (form.type === 'secondhand') {
    extra.price = form.price
    extra.condition = form.condition
    extra.allowBargain = true
  } else if (form.type === 'lostfound') {
    extra.lostOrFound = form.lostOrFound
    extra.eventTime = form.eventTime
    extra.itemFeature = form.itemFeature
  } else if (form.type === 'group') {
    extra.targetCount = form.targetCount
    extra.currentCount = 1
    extra.deadline = form.deadline
  } else if (form.type === 'errand') {
    extra.reward = form.reward
    extra.taskPlace = form.taskPlace
    extra.expectedTime = form.expectedTime
  }

  return { ...base, ...extra }
}

async function handleSubmit() {
  if (!formRef.value) return
  try {
    await formRef.value.validate()
  } catch (err) {
    console.warn('表单验证不通过:', err)
    return
  }

  submitted = true  // 标记已提交，退出时不清理图片
  const data = buildSubmitData()
  console.log('提交数据:', data)
  emit('submit', data)
  ElMessage.success(`发布${typeLabel.value}信息成功`)
}
</script>

<template>
  <ElForm ref="formRef" :model="form" label-width="100px" class="publish-form">
    <ElFormItem label="信息类型">
      <ElSelect v-model="form.type">
        <ElOption v-for="t in ITEM_TYPES" :key="t.value" :label="t.label" :value="t.value" />
      </ElSelect>
    </ElFormItem>

    <ElFormItem label="标题" prop="title" :rules="[{ required: true, message: '请输入标题' }]">
      <ElInput v-model="form.title" placeholder="请输入信息标题" />
    </ElFormItem>

    <ElFormItem label="描述" prop="description" :rules="[{ required: true, message: '请输入描述' }]">
      <ElInput v-model="form.description" type="textarea" :rows="4" placeholder="请详细描述..." />
    </ElFormItem>

    <ElFormItem label="校区" prop="campus" :rules="[{ required: true, message: '请选择校区' }]">
      <ElSelect v-model="form.campus" placeholder="请选择校区">
        <ElOption v-for="c in CAMPUS_LIST" :key="c" :label="c" :value="c" />
      </ElSelect>
    </ElFormItem>

    <ElFormItem label="地点">
      <ElInput v-model="form.location" placeholder="如：图书馆门口、三食堂" />
    </ElFormItem>

    <ElFormItem label="标签">
      <ElInput v-model="form.tags" placeholder="用逗号分隔，如：教材, 二手" />
    </ElFormItem>

    <ElFormItem label="商品图片">
      <div class="image-upload-wrapper">
        <div class="upload-grid">
          <!-- 已上传图片预览 -->
          <div
            v-for="(img, idx) in imagePreviewList"
            :key="idx"
            class="preview-card"
          >
            <img :src="imageUrl(img)" class="preview-img" alt="" />
            <span class="preview-remove" @click="removeImage(idx)">×</span>
          </div>

          <!-- 添加图片按钮 -->
          <div class="upload-card">
            <input
              :key="uploadKey"
              type="file"
              accept=".jpg,.jpeg"
              multiple
              class="file-input"
              :disabled="uploading"
              @change="handleFileSelect"
            />
            <div class="upload-card-inner" :class="{ uploading: uploading }">
              <span class="upload-plus" v-if="!uploading">+</span>
              <span class="upload-plus loading" v-else>↻</span>
              <span class="upload-label">{{ uploading ? '上传中' : '添加图片' }}</span>
            </div>
          </div>
        </div>
        <p class="upload-hint">仅支持 JPG 格式，点击或拖拽添加图片</p>
      </div>
    </ElFormItem>

    <!-- 二手交易专属字段 -->
    <template v-if="form.type === 'secondhand'">
      <ElFormItem label="价格" prop="price" :rules="[{ required: true, message: '请输入价格' }]">
        <ElInputNumber v-model="form.price" :min="0" :precision="2" placeholder="请输入价格" />
      </ElFormItem>
      <ElFormItem label="成色">
        <ElSelect v-model="form.condition" placeholder="请选择成色">
          <ElOption label="全新" value="全新" />
          <ElOption label="几乎全新" value="几乎全新" />
          <ElOption label="良好" value="良好" />
          <ElOption label="一般" value="一般" />
        </ElSelect>
      </ElFormItem>
    </template>

    <!-- 失物招领专属字段 -->
    <template v-if="form.type === 'lostfound'">
      <ElFormItem label="类型" prop="lostOrFound">
        <ElRadioGroup v-model="form.lostOrFound">
          <ElRadio value="lost">丢失</ElRadio>
          <ElRadio value="found">捡到</ElRadio>
        </ElRadioGroup>
      </ElFormItem>
      <ElFormItem label="发生时间">
        <ElInput v-model="form.eventTime" placeholder="如：2026-06-25 下午" />
      </ElFormItem>
      <ElFormItem label="物品特征">
        <ElInput v-model="form.itemFeature" placeholder="描述物品的外观、品牌、颜色等特征" />
      </ElFormItem>
    </template>

    <!-- 拼单搭子专属字段 -->
    <template v-if="form.type === 'group'">
      <ElFormItem label="目标人数" prop="targetCount" :rules="[{ required: true, message: '请输入目标人数' }]">
        <ElInputNumber v-model="form.targetCount" :min="2" :max="50" />
      </ElFormItem>
      <ElFormItem label="截止时间">
        <ElInput v-model="form.deadline" placeholder="如：2026-07-01 18:00" />
      </ElFormItem>
    </template>

    <!-- 跑腿委托专属字段 -->
    <template v-if="form.type === 'errand'">
      <ElFormItem label="酬劳" prop="reward" :rules="[{ required: true, message: '请输入酬劳' }]">
        <ElInputNumber v-model="form.reward" :min="0" :precision="2" placeholder="请输入酬劳" />
      </ElFormItem>
      <ElFormItem label="任务地点">
        <ElInput v-model="form.taskPlace" placeholder="如：北校区菜鸟驿站" />
      </ElFormItem>
      <ElFormItem label="期望完成时间">
        <ElInput v-model="form.expectedTime" placeholder="如：2026-06-28 前" />
      </ElFormItem>
    </template>

    <ElFormItem>
      <ElButton type="primary" @click="handleSubmit" :loading="uploading" :disabled="uploading">
        {{ uploading ? '图片上传中...' : '发布信息' }}
      </ElButton>
    </ElFormItem>
  </ElForm>
</template>

<style scoped>
.publish-form {
  max-width: 600px;
}

/* 图片上传 */
.image-upload-wrapper {
  width: 100%;
}
.upload-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

/* 预览卡片 */
.preview-card {
  position: relative;
  width: 100px;
  height: 100px;
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid var(--c-border-light);
  background: #f8f9fa;
  flex-shrink: 0;
}
.preview-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.preview-remove {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: rgba(0,0,0,0.45);
  color: #fff;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  line-height: 1;
  transition: background 0.15s;
}
.preview-remove:hover {
  background: rgba(220, 50, 50, 0.85);
}

/* 添加按钮卡片 */
.upload-card {
  position: relative;
  width: 100px;
  height: 100px;
  flex-shrink: 0;
}
.file-input {
  position: absolute;
  inset: 0;
  opacity: 0;
  cursor: pointer;
  z-index: 2;
}
.file-input:disabled {
  cursor: not-allowed;
}
.upload-card-inner {
  width: 100%;
  height: 100%;
  border: 2px dashed var(--c-border);
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  cursor: pointer;
  transition: all 0.2s;
  color: var(--c-text-muted);
  background: var(--c-bg);
}
.upload-card-inner:hover {
  border-color: var(--c-primary);
  color: var(--c-primary);
  background: var(--c-primary-lighter);
}
.upload-card-inner.uploading {
  opacity: 0.5;
  cursor: not-allowed;
  border-color: var(--c-border);
}
.upload-plus {
  font-size: 28px;
  font-weight: 300;
  line-height: 1;
  color: var(--c-text-muted);
}
.upload-card-inner:hover .upload-plus {
  color: var(--c-primary);
}
.upload-plus.loading {
  animation: spin 1s linear infinite;
  font-size: 24px;
}
.upload-label {
  font-size: 12px;
  line-height: 1;
}

.upload-hint {
  margin: 10px 0 0;
  font-size: 12px;
  color: var(--c-text-muted);
}
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
