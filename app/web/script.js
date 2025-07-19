// 使用ES6模块导入 minidb
import { MiniDB } from "@lazycatcloud/minidb";

class MiniDBTester {
    constructor() {
        this.db = new MiniDB();
        this.testCollection = this.db.getCollection("minidb_test");
        this.initEventListeners();
        this.updateStatus('应用已初始化，准备开始测试');
    }

    // 生成测试数据 - 基于官方文档示例 [citation](1)
    async generateTestData() {
        console.log('开始生成测试数据...');
        
        const testDocs = [...Array(100)].map((_, index) => {
            const doc = {
                index,
                name: `name-${index}`,
                email: `user${index}@test.com`,
                age: 20 + (index % 50),
                department: ['技术部', '市场部', '人事部', '财务部'][index % 4],
                createTime: new Date().toISOString(),
                isActive: index % 3 !== 0
            };
            
            // 为最后一个文档添加特殊标记，参考官方示例 [citation](1)
            if (index === 99) {
                doc.last = true;
            }
            
            return doc;
        });
        
        try {
            await this.testCollection.upsert(testDocs);
            this.updateResults({
                success: true,
                message: '测试数据生成完成',
                count: testDocs.length,
                data: testDocs.slice(0, 5) // 只显示前5条
            });
            this.updateStatus('测试数据生成成功');
        } catch (error) {
            console.error('生成测试数据失败:', error);
            this.updateResults({
                success: false,
                message: '生成测试数据失败',
                error: error.message
            });
        }
    }

    // $in 查询测试 [citation](1)
    async testInQuery() {
        try {
            const result = await this.testCollection
                .find({ index: { $in: [0, 1, 2, 3, 4, 5] } }, { sort: ["index"] })
                .fetch();
            
            this.updateResults({
                success: true,
                message: '$in 查询测试完成',
                query: '查询 index 在 [0,1,2,3,4,5] 范围内的数据',
                count: result.length,
                data: result
            });
        } catch (error) {
            this.updateResults({
                success: false,
                message: '$in 查询失败',
                error: error.message
            });
        }
    }

    // $eq 查询测试 [citation](1)
    async testEqQuery() {
        try {
            const result = await this.testCollection.findOne({ index: { $eq: 5 } });
            
            this.updateResults({
                success: true,
                message: '$eq 查询测试完成',
                query: '查询 index 等于 5 的数据',
                data: result
            });
        } catch (error) {
            this.updateResults({
                success: false,
                message: '$eq 查询失败',
                error: error.message
            });
        }
    }

    // $gt 和 $gte 查询测试 [citation](1)
    async testGtQuery() {
        try {
            const gtResult = await this.testCollection
                .find({ index: { $gt: 90 } }, { sort: ["index"] })
                .fetch();
                
            const gteResult = await this.testCollection
                .find({ index: { $gte: 90 } }, { sort: ["index"] })
                .fetch();
            
            this.updateResults({
                success: true,
                message: '$gt 和 $gte 查询测试完成',
                gtQuery: '查询 index 大于90的数据',
                gtCount: gtResult.length,
                gtData: gtResult,
                gteQuery: '查询 index 大于等于90的数据',
                gteCount: gteResult.length,
                gteData: gteResult
            });
        } catch (error) {
            this.updateResults({
                success: false,
                message: '$gt/$gte 查询失败',
                error: error.message
            });
        }
    }

    // $exists 查询测试 [citation](1)
    async testExistsQuery() {
        try {
            const result = await this.testCollection
                .find({ $exists: "last" }, { sort: ["index"] })
                .fetch();
            
            this.updateResults({
                success: true,
                message: '$exists 查询测试完成',
                query: '查询存在 last 字段的数据',
                count: result.length,
                data: result
            });
        } catch (error) {
            this.updateResults({
                success: false,
                message: '$exists 查询失败',
                error: error.message
            });
        }
    }

    // $like 查询测试 [citation](1)
    async testLikeQuery() {
        try {
            const simpleResult = await this.testCollection
                .find({ name: { $like: `name-1` } }, { sort: ["index"] })
                .fetch();
                
            const regexResult = await this.testCollection
                .find({ name: { $like: `name-1[5678]` } }, { sort: ["index"] })
                .fetch();
            
            this.updateResults({
                success: true,
                message: '$like 查询测试完成',
                simpleQuery: '简单模糊查询：包含"name-1"',
                simpleCount: simpleResult.length,
                simpleData: simpleResult.slice(0, 5),
                regexQuery: '正则表达式查询：匹配"name-1[5678]"',
                regexCount: regexResult.length,
                regexData: regexResult
            });
        } catch (error) {
            this.updateResults({
                success: false,
                message: '$like 查询失败',
                error: error.message
            });
        }
    }

    // 清理测试数据
    async clearData() {
        try {
            await this.db.removeCollection("minidb_test");
            this.updateResults({
                success: true,
                message: '测试数据清理完成'
            });
            this.updateStatus('数据已清理');
        } catch (error) {
            this.updateResults({
                success: false,
                message: '清理数据失败',
                error: error.message
            });
        }
    }

    // 初始化事件监听器
    initEventListeners() {
        document.getElementById('generateData').addEventListener('click', () => this.generateTestData());
        document.getElementById('clearData').addEventListener('click', () => this.clearData());
        document.getElementById('testInQuery').addEventListener('click', () => this.testInQuery());
        document.getElementById('testEqQuery').addEventListener('click', () => this.testEqQuery());
        document.getElementById('testGtQuery').addEventListener('click', () => this.testGtQuery());
        document.getElementById('testExistsQuery').addEventListener('click', () => this.testExistsQuery());
        document.getElementById('testLikeQuery').addEventListener('click', () => this.testLikeQuery());
    }

    // 更新结果显示
    updateResults(result) {
        const resultsContainer = document.getElementById('results');
        const resultItem = document.createElement('div');
        resultItem.className = `result-item ${result.success ? '' : 'error'}`;
        
        resultItem.innerHTML = `
            <h3>${result.message}</h3>
            ${result.query ? `<p><strong>查询:</strong> ${result.query}</p>` : ''}
            ${result.count !== undefined ? `<p><strong>结果数量:</strong> ${result.count}</p>` : ''}
            ${result.error ? `<p><strong>错误:</strong> ${result.error}</p>` : ''}
            ${result.data ? `<div class="data-preview">${JSON.stringify(result.data, null, 2)}</div>` : ''}
        `;
        
        resultsContainer.appendChild(resultItem);
        resultsContainer.scrollTop = resultsContainer.scrollHeight;
    }

    // 更新状态显示
    updateStatus(message) {
        const statusContainer = document.getElementById('status');
        const timestamp = new Date().toLocaleTimeString();
        statusContainer.innerHTML = `<p>[${timestamp}] ${message}</p>`;
    }
}

// 等待DOM加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    const tester = new MiniDBTester();
    console.log('MiniDB 测试应用已初始化');
});