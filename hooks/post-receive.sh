   #!/bin/bash

   # 读取标准输入的旧的和新的提交哈希值以及引用名称
   while read oldrev newrev ref
   do
       # 检查是否是 main 分支
       if [[ "$ref" == "refs/heads/main" ]]; then
           # 触发 webhook
           curl -X POST -H "Content-Type: application/json" -d '{"text": "Code pushed to master branch"}' http://192.168.11.102:3000/api/deploy/_8A2IuM245Ijc9a2Ge9Pr
       fi
   done