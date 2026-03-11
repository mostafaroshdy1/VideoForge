import { create } from 'zustand'
import type { TranscodeJob, VideoFile, TranscodeProgress, TranscodeStatus } from '@/types'
import { v4 as uuidv4 } from 'uuid'
import { abortTranscoding } from '@/lib/ffmpeg'

interface TranscodeStore {
  jobs: TranscodeJob[]
  currentJobId: string | null
  
  addJob: (videoFile: VideoFile) => string
  updateJobProgress: (jobId: string, progress: Partial<TranscodeProgress>) => void
  updateJobStatus: (jobId: string, status: TranscodeStatus, error?: string) => void
  setJobOutput: (jobId: string, blob: Blob, filename: string) => void
  removeJob: (jobId: string) => void
  clearCompleted: () => void
  setCurrentJob: (jobId: string | null) => void
  getNextPendingJob: () => TranscodeJob | null
  abortCurrentJob: () => void
}

export const useTranscodeStore = create<TranscodeStore>((set, get) => ({
  jobs: [],
  currentJobId: null,

  addJob: (videoFile: VideoFile) => {
    const jobId = uuidv4()
    const job: TranscodeJob = {
      id: jobId,
      videoFile,
      status: 'pending',
      progress: {
        percentage: 0,
        currentFrame: 0,
        totalFrames: 0,
        fps: 0,
        speed: '0x',
        timeElapsed: 0,
        timeRemaining: 0,
        currentSize: 0,
      },
      startTime: Date.now(),
    }
    set((state) => ({ jobs: [...state.jobs, job] }))
    return jobId
  },

  updateJobProgress: (jobId: string, progress: Partial<TranscodeProgress>) => {
    set((state) => ({
      jobs: state.jobs.map((job) =>
        job.id === jobId
          ? { ...job, progress: { ...job.progress, ...progress } }
          : job
      ),
    }))
  },

  updateJobStatus: (jobId: string, status: TranscodeStatus, error?: string) => {
    set((state) => ({
      jobs: state.jobs.map((job) =>
        job.id === jobId
          ? {
              ...job,
              status,
              error,
              endTime: status === 'completed' || status === 'error' ? Date.now() : job.endTime,
            }
          : job
      ),
    }))
  },

  setJobOutput: (jobId: string, blob: Blob, filename: string) => {
    set((state) => ({
      jobs: state.jobs.map((job) =>
        job.id === jobId
          ? { ...job, outputBlob: blob, outputFilename: filename }
          : job
      ),
    }))
  },

  removeJob: (jobId: string) => {
    set((state) => ({
      jobs: state.jobs.filter((job) => job.id !== jobId),
      currentJobId: state.currentJobId === jobId ? null : state.currentJobId,
    }))
  },

  clearCompleted: () => {
    set((state) => ({
      jobs: state.jobs.filter((job) => job.status !== 'completed'),
    }))
  },

  setCurrentJob: (jobId: string | null) => {
    set({ currentJobId: jobId })
  },

  getNextPendingJob: () => {
    const state = get()
    return state.jobs.find((job) => job.status === 'pending') ?? null
  },

  abortCurrentJob: () => {
    const state = get()
    if (state.currentJobId) {
      abortTranscoding()
      set((prevState) => ({
        jobs: prevState.jobs.map((job) =>
          job.id === state.currentJobId
            ? { ...job, status: 'error' as TranscodeStatus, error: 'Aborted by user' }
            : job
        ),
        currentJobId: null,
      }))
    }
  },
}))
