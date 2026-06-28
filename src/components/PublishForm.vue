<script setup lang="ts">
import { reactive, computed, ref } from 'vue'
import { ElForm, ElFormItem, ElInput, ElSelect, ElOption, ElButton, ElMessage, ElRadioGroup, ElRadio, ElInputNumber, ElTag } from 'element-plus'
import { ITEM_TYPES, CAMPUS_LIST } from '@/utils/constants'
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
  imageUrls: '',
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

const imagePreviewList = computed(() => {
  return form.imageUrls
    .split(/[,，\n]/)
    .map(s => s.trim())
    .filter(Boolean)
})

function buildSubmitData(): Partial<Item> {
  const tags = form.tags
    ? form.tags.split(/[,，、]/).map(s => s.trim()).filter(Boolean)
    : []

  const images = form.imageUrls
    ? form.imageUrls.split(/[,，\n]/).map(s => s.trim()).filter(Boolean)
    : []

  const base = {
    type: form.type,
    title: form.title,
    description: form.description,
    campus: form.campus,
    location: form.location,
    tags,
    images,
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
  } catch {
    return
  }

  emit('submit', buildSubmitData())
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

    <ElFormItem label="图片链接">
      <ElInput
        v-model="form.imageUrls"
        type="textarea"
        :rows="2"
        placeholder="每行一个图片链接，或用逗号分隔"
      />
      <div v-if="imagePreviewList.length > 0" class="image-preview">
        <ElTag
          v-for="(url, idx) in imagePreviewList"
          :key="idx"
          size="small"
          type="info"
          class="preview-tag"
        >
          图片 {{ idx + 1 }}
        </ElTag>
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
      <ElButton type="primary" @click="handleSubmit">发布信息</ElButton>
    </ElFormItem>
  </ElForm>
</template>

<style scoped>
.publish-form {
  max-width: 600px;
}
.image-preview {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 8px;
}
.preview-tag {
  cursor: default;
}
</style>
