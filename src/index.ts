import { createFetch } from 'ofetch'

// Read these from ENV
const {
  RANCHER_BEARER_TOKEN,
  RANCHER_CLUSTER_ID,
  RANCHER_NAMESPACE,
  RANCHER_PROJECT_ID,
  RANCHER_URL,
  RANCHER_WORKLOAD,
  IMAGE_TAG
} = process.env

// ---------------------------------------------------------------------------------------------------------------------
// Check for required environment variables
// ---------------------------------------------------------------------------------------------------------------------

const required = [
  'RANCHER_BEARER_TOKEN',
  'RANCHER_CLUSTER_ID',
  'RANCHER_NAMESPACE',
  'RANCHER_PROJECT_ID',
  'RANCHER_URL',
  'RANCHER_WORKLOAD'
]

const missing = required.filter(key => !process.env[key])
if (missing.length > 0) {
  throw new Error(`Required environment variables missing: ${missing.join(', ')}`)
}

const $fetch = createFetch({
  defaults: {
    baseURL: RANCHER_URL,
    headers: {
      authorization: `Bearer ${RANCHER_BEARER_TOKEN}`
    },
    timeout: 10_000
  }
})

async function main() {
  console.log('Redeploying workload...')

  const workloadURL = `/v3/project/${RANCHER_CLUSTER_ID}:${RANCHER_PROJECT_ID}/workloads/deployment:${RANCHER_NAMESPACE}:${RANCHER_WORKLOAD}`

  // Step 1: Get the workload
  const data = await $fetch(workloadURL)

  // Step 3: Push the modified workload
  await $fetch(workloadURL, {
    method: 'PUT',
    body: {
      ...data,
      annotations: {
        ...data.annotations,
        'cattle.io/timestamp': new Date().toISOString()
      },
      containers: [
        {
          ...data.containers[0],
          image: IMAGE_TAG ? `${data.containers[0].image.split(':')[0]}:${IMAGE_TAG}` : data.containers[0].image
        }
      ]
    }
  })
}

main()
  .then(() => {
    console.log('Workload successfully deployed.')
    process.exit(0)
  })
  .catch((error) => {
    console.error(error.message)
    process.exit(1)
  })
