const assetLinks = [
  {
    relation: ["delegate_permission/common.handle_all_urls"],
    target: {
      namespace: "android_app",
      package_name: "com.fittribe.app",
      sha256_cert_fingerprints: [
        "AB:CC:CD:73:34:7E:98:BE:DA:D6:0A:E5:88:7D:FC:3F:31:E1:95:FD:34:84:1A:6E:91:2D:C1:DB:81:60:32:0F",
      ],
    },
  },
];

export function GET() {
  return Response.json(assetLinks);
}
