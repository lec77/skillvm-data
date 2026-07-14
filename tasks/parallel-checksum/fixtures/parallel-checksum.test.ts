import { expect, test, describe } from "bun:test"
import { readFileSync, existsSync } from "fs"

const REFERENCE_CHECKSUMS: Record<string, string> = {
  "data_00.bin": "b3981d93eeb64aa900f3e48cfcd48e9bbc89b77732c49ea201c93656c62b6a09",
  "data_01.bin": "608826c440a49698adbaf06db58534fb30db3e37cac259d5b6cd5c72f63a25ba",
  "data_02.bin": "493c2b5f3d9f1454d50e8372751025b2a2921b5bfb73432419630e967d2ddbe6",
  "data_03.bin": "fff966d03955ee198b30f225cf2bc8d94292cee30cb5b4520ec12dc5a893b1d5",
  "data_04.bin": "7cc387b520ff4fcf4335ae8ccc35f23079b4ff52f30e297548e05d67406c942b",
  "data_05.bin": "ad4cb2afea00dff7c207667d53d16287adec9c358d948356a76359b21c6a955a",
  "data_06.bin": "2df52b02a61d11618151deaaebfc3c7f8b860af45c4a047a47cb65777b786b51",
  "data_07.bin": "4b1a0130f3676872a5734c80a1d89ec1ddc6c4a11f1579984d8b579de75d58cd",
  "data_08.bin": "a9bc5bd59e89f25235c989a6ef547d95ff6eb9ba147aba518dcd2529943a4f39",
  "data_09.bin": "606f90cbeea9116b80065bf3f151183f92aa38dead2bbdec7ad1c5f67a8c887a",
  "data_10.bin": "402be1ab04705ce1a13d29c878e698c0c0f611dfb94bc5782d319354c4bcfa2b",
  "data_11.bin": "a20a766d66a91b2d32d5aba4af574fecbb805774e18ff897930e095c77e94cb7",
  "data_12.bin": "d8236ba9b16afd7a7b3ef0aa01c1bfb761cd1acb9858280fa4177eff02183ac9",
  "data_13.bin": "29b3a7f3f707050b6cd9ae89e4a1bed175c44cdb282c0720f9ea83b4f049f46a",
  "data_14.bin": "894c69b213d1ad5f5e906b936cec4f8163a88b5aee33cb40bbba42f1aabe0ff4",
  "data_15.bin": "6574fd9585a460421e1fee16404433b978a7732e99862fb9332816c64322bb6a",
  "data_16.bin": "139d741b474cba2a65444ab3a61d920b802e76ce59694f58ff90414edd1da22d",
  "data_17.bin": "773d1a59f6a2fcbad1adc6cb0e9e5d66a6399020ebde163c4560791f263a385c",
  "data_18.bin": "faf8f5a7719f2125860830d23da991e08c0a09774218ee7e7a0b59c59ebb5a71",
  "data_19.bin": "6960924782b531e48a2a42f6072ba4254c651e331af1d47f9e9c51719e582869",
  "data_20.bin": "6e48b705bb22cadbe0578e2b3d6093a3d4b0d03bad3011776de545406082f9c9",
  "data_21.bin": "d24a330c1ee1f329e6736061666f667c41ffea2c8af73eff457dba7d622ae912",
  "data_22.bin": "24fd67373539043ab370a9a73ba6273c1a4c315de2d0aab1bc47bac6382fd178",
  "data_23.bin": "224eeb539915606f469e6a1764778cd2fd2aacd9e868bf5859732caf1f853264",
  "data_24.bin": "2d2452cdb056a42a3319c66761b0acea83b84792caf82ddceaeb454e19ec220c",
  "data_25.bin": "a7c1f5d8ef3b7d918a31230a155075f72790439e17cae2c16eef90d3199a2d02",
  "data_26.bin": "0de658cb4ab28cacad18e80eb19398632a7db251aba7a3cddd392c1b9e8e80c7",
  "data_27.bin": "c9d580737eb0a052eb4440dbf855a33bdf9bf64ed1c0d1094c0e2f83156899df",
  "data_28.bin": "627f9ddfa384fd9bee5e5df364f0c6271f0c63661668b7f447fef9749d4d5aa8",
  "data_29.bin": "e93e40b1d3215ba61eca4f6b750a9873d93863347215ecf58c7d31021617deac",
}

const EXPECTED_FILENAMES = Object.keys(REFERENCE_CHECKSUMS).sort()

let data: Record<string, string> = {}
let parseError = false
try {
  data = JSON.parse(readFileSync("checksums.json", "utf-8"))
} catch {
  parseError = true
}

describe("output exists", () => {
  test("checksums.json exists", () => {
    expect(existsSync("checksums.json")).toBe(true)
  })

  test("checksums.json is valid JSON object", () => {
    expect(parseError).toBe(false)
    expect(typeof data).toBe("object")
    expect(data).not.toBeNull()
    expect(Array.isArray(data)).toBe(false)
  })
})

describe("entry count", () => {
  test("checksums.json has exactly 30 entries", () => {
    expect(Object.keys(data).length).toBe(30)
  })
})

describe("checksums correct", () => {
  test("data_00.bin checksum matches reference", () => {
    expect(data["data_00.bin"]).toBe(REFERENCE_CHECKSUMS["data_00.bin"])
  })

  test("data_15.bin checksum matches reference", () => {
    expect(data["data_15.bin"]).toBe(REFERENCE_CHECKSUMS["data_15.bin"])
  })

  test("data_29.bin checksum matches reference", () => {
    expect(data["data_29.bin"]).toBe(REFERENCE_CHECKSUMS["data_29.bin"])
  })

  test("all 30 checksums match reference values", () => {
    for (const [fname, expected] of Object.entries(REFERENCE_CHECKSUMS)) {
      expect(data[fname]).toBe(expected)
    }
  })

  test("all checksum values are 64-character hex strings", () => {
    for (const digest of Object.values(data)) {
      expect(typeof digest).toBe("string")
      expect(digest).toMatch(/^[0-9a-f]{64}$/)
    }
  })
})

describe("sorted order", () => {
  test("output keys are sorted alphabetically by filename", () => {
    const actualKeys = Object.keys(data)
    const sortedKeys = [...actualKeys].sort()
    expect(actualKeys).toEqual(sortedKeys)
  })

  test("first key is data_00.bin and last key is data_29.bin", () => {
    const keys = Object.keys(data)
    expect(keys[0]).toBe("data_00.bin")
    expect(keys[keys.length - 1]).toBe("data_29.bin")
  })
})

describe("uses parallel", () => {
  test("parallel_checksum.py exists", () => {
    expect(existsSync("parallel_checksum.py")).toBe(true)
  })

  test("script source contains multiprocessing or concurrent.futures", () => {
    const source = readFileSync("parallel_checksum.py", "utf-8")
    const usesParallel =
      source.includes("multiprocessing") ||
      source.includes("concurrent.futures") ||
      source.includes("ProcessPoolExecutor") ||
      source.includes("ThreadPoolExecutor")
    expect(usesParallel).toBe(true)
  })

  test("script uses a pool or executor pattern", () => {
    const source = readFileSync("parallel_checksum.py", "utf-8")
    const usesAPI =
      source.includes("Pool(") ||
      source.includes("pool.map") ||
      source.includes("pool.starmap") ||
      source.includes("apply_async") ||
      source.includes("ProcessPoolExecutor(") ||
      source.includes("ThreadPoolExecutor(") ||
      source.includes("executor.map") ||
      source.includes(".submit(")
    expect(usesAPI).toBe(true)
  })
})

describe("all files present", () => {
  test("all 30 expected filenames are present in output", () => {
    for (const fname of EXPECTED_FILENAMES) {
      expect(data).toHaveProperty(fname)
    }
  })

  test("filenames follow data_NN.bin pattern", () => {
    for (const fname of Object.keys(data)) {
      expect(fname).toMatch(/^data_\d{2}\.bin$/)
    }
  })
})
