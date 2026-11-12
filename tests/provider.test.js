import test from 'node:test';
import assert from 'node:assert/strict';
import handler from '../api/provider.js';
function response(){return {code:0,data:null,setHeader(){},status(n){this.code=n;return this;},json(d){this.data=d;return this;}};}
test('unconfigured provider reports disconnected and refuses paid requests',async()=>{delete process.env.OPENAI_API_KEY;delete process.env.STUDIO_ACCESS_TOKEN;const get=response();await handler({method:'GET'},get);assert.equal(get.data.connected,false);const post=response();await handler({method:'POST',headers:{},body:{}},post);assert.equal(post.code,503);});
test('configured provider rejects wrong tokens before any upstream request',async()=>{process.env.OPENAI_API_KEY='test-only';process.env.STUDIO_ACCESS_TOKEN='test-only-secret';const res=response();await handler({method:'POST',headers:{authorization:'Bearer wrong'},body:{}},res);assert.equal(res.code,401);delete process.env.OPENAI_API_KEY;delete process.env.STUDIO_ACCESS_TOKEN;});
