import path from 'path'
import { spawn } from 'child_process'
import ffmpegPath from 'ffmpeg-static'
import ffprobe from 'ffprobe-static'
const ffprobePath = ffprobe.path

const MAXIMUM_BITRATE_720P = 5 * 10 ** 6
const MAXIMUM_BITRATE_1080P = 8 * 10 ** 6
const MAXIMUM_BITRATE_1440P = 16 * 10 ** 6

// =======================
// HELPER RUN COMMAND
// =======================
const run = (cmd: string, args: string[]) => {
  return new Promise<string>((resolve, reject) => {
    const process = spawn(cmd, args)

    let stdout = ''
    let stderr = ''

    process.stdout.on('data', (data) => {
      stdout += data.toString()
    })

    process.stderr.on('data', (data) => {
      stderr += data.toString()
    })

    process.on('close', (code) => {
      if (code !== 0) {
        return reject(new Error(stderr))
      }
      resolve(stdout)
    })
  })
}

// =======================
// FFPROBE
// =======================
export const checkVideoHasAudio = async (filePath: string) => {
  const stdout = await run(ffprobePath!, [
    '-v',
    'error',
    '-select_streams',
    'a:0',
    '-show_entries',
    'stream=codec_type',
    '-of',
    'default=nw=1:nk=1',
    filePath
  ])
  return stdout.trim() === 'audio'
}

const getBitrate = async (filePath: string) => {
  const stdout = await run(ffprobePath!, [
    '-v',
    'error',
    '-select_streams',
    'v:0',
    '-show_entries',
    'stream=bit_rate',
    '-of',
    'default=nw=1:nk=1',
    filePath
  ])
  return Number(stdout.trim())
}

const getResolution = async (filePath: string) => {
  const stdout = await run(ffprobePath!, [
    '-v',
    'error',
    '-select_streams',
    'v:0',
    '-show_entries',
    'stream=width,height',
    '-of',
    'csv=s=x:p=0',
    filePath
  ])

  const [width, height] = stdout.trim().split('x')
  return {
    width: Number(width),
    height: Number(height)
  }
}

// =======================
// UTILS
// =======================
const getWidth = (height: number, resolution: { width: number; height: number }) => {
  const width = Math.round((height * resolution.width) / resolution.height)
  return width % 2 === 0 ? width : width + 1
}

// =======================
// MAIN ENCODE
// =======================
export const encodeHLSWithMultipleVideoStreams = async (inputPath: string) => {
  const [bitrate, resolution, isHasAudio] = await Promise.all([
    getBitrate(inputPath),
    getResolution(inputPath),
    checkVideoHasAudio(inputPath)
  ])

  const parent = path.dirname(inputPath)

  const outputSegmentPath = path.join(parent, 'v%v/fileSequence%d.ts')
  const outputPath = path.join(parent, 'v%v/prog_index.m3u8')

  const streams: { height: number; bitrate: number }[] = []

  // build ladder
  if (resolution.height >= 720) {
    streams.push({
      height: 720,
      bitrate: Math.min(bitrate, MAXIMUM_BITRATE_720P)
    })
  }

  if (resolution.height >= 1080) {
    streams.push({
      height: 1080,
      bitrate: Math.min(bitrate, MAXIMUM_BITRATE_1080P)
    })
  }

  if (resolution.height >= 1440) {
    streams.push({
      height: 1440,
      bitrate: Math.min(bitrate, MAXIMUM_BITRATE_1440P)
    })
  }

  // original
  if (resolution.height > 1440) {
    streams.push({
      height: resolution.height,
      bitrate: bitrate
    })
  }

  // =======================
  // BUILD FFMPEG ARGS
  // =======================
  const args: string[] = [
    '-y',
    '-i',
    inputPath,
    '-preset',
    'veryfast', // ⚠️ giảm từ veryslow → nhanh hơn dev
    '-g',
    '48',
    '-sc_threshold',
    '0'
  ]

  // mapping
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  streams.forEach((_, i) => {
    args.push('-map', '0:0')
    if (isHasAudio) args.push('-map', '0:1')
  })

  // video encode
  streams.forEach((stream, i) => {
    const width = getWidth(stream.height, resolution)

    args.push(`-s:v:${i}`, `${width}x${stream.height}`, `-c:v:${i}`, 'libx264', `-b:v:${i}`, `${stream.bitrate}`)
  })

  if (isHasAudio) {
    args.push('-c:a', 'aac', '-b:a', '128k')
  }

  // var stream map
  const varStreamMap = streams.map((_, i) => (isHasAudio ? `v:${i},a:${i}` : `v:${i}`)).join(' ')

  args.push(
    '-var_stream_map',
    varStreamMap,
    '-master_pl_name',
    'master.m3u8',
    '-f',
    'hls',
    '-hls_time',
    '6',
    '-hls_list_size',
    '0',
    '-hls_segment_filename',
    outputSegmentPath,
    outputPath
  )

  console.log('FFMPEG ARGS:', args.join(' '))

  await run(ffmpegPath!, args)

  return true
}
