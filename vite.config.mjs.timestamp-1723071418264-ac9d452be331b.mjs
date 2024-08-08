// vite.config.mjs
import { defineConfig, loadEnv } from "file:///E:/laragon/www/plantillacontabilidad/node_modules/vite/dist/node/index.js";
import vue from "file:///E:/laragon/www/plantillacontabilidad/node_modules/@vitejs/plugin-vue/dist/index.mjs";
import path from "node:path";
import autoprefixer from "file:///E:/laragon/www/plantillacontabilidad/node_modules/autoprefixer/lib/autoprefixer.js";
var __vite_injected_original_dirname = "E:\\laragon\\www\\plantillacontabilidad";
var vite_config_default = defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  process.env = { ...process.env, ...env };
  return {
    plugins: [vue()],
    base: "./",
    css: {
      postcss: {
        plugins: [
          autoprefixer({})
          // add options if needed
        ]
      }
    },
    resolve: {
      alias: [
        // webpack path resolve to vitejs
        {
          find: /^~(.*)$/,
          replacement: "$1"
        },
        {
          find: "@/",
          replacement: `${path.resolve(__vite_injected_original_dirname, "src")}/`
        },
        {
          find: "@",
          replacement: path.resolve(__vite_injected_original_dirname, "/src")
        }
      ],
      extensions: [
        ".mjs",
        ".js",
        ".ts",
        ".jsx",
        ".tsx",
        ".json",
        ".vue",
        ".scss"
      ]
    },
    server: {
      port: 8080,
      proxy: {
        // https://vitejs.dev/config/server-options.html
      }
    },
    define: {
      // vitejs does not support process.env so we have to redefine it
      "process.env": process.env
    }
  };
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcubWpzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiRTpcXFxcbGFyYWdvblxcXFx3d3dcXFxccGxhbnRpbGxhY29udGFiaWxpZGFkXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJFOlxcXFxsYXJhZ29uXFxcXHd3d1xcXFxwbGFudGlsbGFjb250YWJpbGlkYWRcXFxcdml0ZS5jb25maWcubWpzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9FOi9sYXJhZ29uL3d3dy9wbGFudGlsbGFjb250YWJpbGlkYWQvdml0ZS5jb25maWcubWpzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnLCBsb2FkRW52IH0gZnJvbSAndml0ZSdcbmltcG9ydCB2dWUgZnJvbSAnQHZpdGVqcy9wbHVnaW4tdnVlJ1xuaW1wb3J0IHBhdGggZnJvbSAnbm9kZTpwYXRoJ1xuaW1wb3J0IGF1dG9wcmVmaXhlciBmcm9tICdhdXRvcHJlZml4ZXInXG5cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZygoeyBtb2RlIH0pID0+IHtcbiAgLy8gTG9hZCAuZW52XG4gIGNvbnN0IGVudiA9IGxvYWRFbnYobW9kZSwgcHJvY2Vzcy5jd2QoKSwgJycpXG4gIHByb2Nlc3MuZW52ID0geyAuLi5wcm9jZXNzLmVudiwgLi4uZW52IH1cblxuICByZXR1cm4ge1xuICAgIHBsdWdpbnM6IFt2dWUoKV0sXG4gICAgYmFzZTogJy4vJyxcbiAgICBjc3M6IHtcbiAgICAgIHBvc3Rjc3M6IHtcbiAgICAgICAgcGx1Z2luczogW1xuICAgICAgICAgIGF1dG9wcmVmaXhlcih7fSkgLy8gYWRkIG9wdGlvbnMgaWYgbmVlZGVkXG4gICAgICAgIF0sXG4gICAgICB9XG4gICAgfSxcbiAgICByZXNvbHZlOiB7XG4gICAgICBhbGlhczogW1xuICAgICAgICAvLyB3ZWJwYWNrIHBhdGggcmVzb2x2ZSB0byB2aXRlanNcbiAgICAgICAge1xuICAgICAgICAgIGZpbmQ6IC9efiguKikkLyxcbiAgICAgICAgICByZXBsYWNlbWVudDogJyQxJyxcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIGZpbmQ6ICdALycsXG4gICAgICAgICAgcmVwbGFjZW1lbnQ6IGAke3BhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICdzcmMnKX0vYCxcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIGZpbmQ6ICdAJyxcbiAgICAgICAgICByZXBsYWNlbWVudDogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJy9zcmMnKSxcbiAgICAgICAgfSxcbiAgICAgIF0sXG4gICAgICBleHRlbnNpb25zOiBbXG4gICAgICAgICcubWpzJyxcbiAgICAgICAgJy5qcycsXG4gICAgICAgICcudHMnLFxuICAgICAgICAnLmpzeCcsXG4gICAgICAgICcudHN4JyxcbiAgICAgICAgJy5qc29uJyxcbiAgICAgICAgJy52dWUnLFxuICAgICAgICAnLnNjc3MnLFxuICAgICAgXSxcbiAgICB9LFxuICAgIHNlcnZlcjoge1xuICAgICAgcG9ydDogODA4MCxcbiAgICAgIHByb3h5OiB7XG4gICAgICAgIC8vIGh0dHBzOi8vdml0ZWpzLmRldi9jb25maWcvc2VydmVyLW9wdGlvbnMuaHRtbFxuICAgICAgfSxcbiAgICB9LFxuICAgIGRlZmluZToge1xuICAgICAgLy8gdml0ZWpzIGRvZXMgbm90IHN1cHBvcnQgcHJvY2Vzcy5lbnYgc28gd2UgaGF2ZSB0byByZWRlZmluZSBpdFxuICAgICAgJ3Byb2Nlc3MuZW52JzogcHJvY2Vzcy5lbnYsXG4gICAgfSxcbiAgfVxufSlcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBd1MsU0FBUyxjQUFjLGVBQWU7QUFDOVUsT0FBTyxTQUFTO0FBQ2hCLE9BQU8sVUFBVTtBQUNqQixPQUFPLGtCQUFrQjtBQUh6QixJQUFNLG1DQUFtQztBQUt6QyxJQUFPLHNCQUFRLGFBQWEsQ0FBQyxFQUFFLEtBQUssTUFBTTtBQUV4QyxRQUFNLE1BQU0sUUFBUSxNQUFNLFFBQVEsSUFBSSxHQUFHLEVBQUU7QUFDM0MsVUFBUSxNQUFNLEVBQUUsR0FBRyxRQUFRLEtBQUssR0FBRyxJQUFJO0FBRXZDLFNBQU87QUFBQSxJQUNMLFNBQVMsQ0FBQyxJQUFJLENBQUM7QUFBQSxJQUNmLE1BQU07QUFBQSxJQUNOLEtBQUs7QUFBQSxNQUNILFNBQVM7QUFBQSxRQUNQLFNBQVM7QUFBQSxVQUNQLGFBQWEsQ0FBQyxDQUFDO0FBQUE7QUFBQSxRQUNqQjtBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBQUEsSUFDQSxTQUFTO0FBQUEsTUFDUCxPQUFPO0FBQUE7QUFBQSxRQUVMO0FBQUEsVUFDRSxNQUFNO0FBQUEsVUFDTixhQUFhO0FBQUEsUUFDZjtBQUFBLFFBQ0E7QUFBQSxVQUNFLE1BQU07QUFBQSxVQUNOLGFBQWEsR0FBRyxLQUFLLFFBQVEsa0NBQVcsS0FBSyxDQUFDO0FBQUEsUUFDaEQ7QUFBQSxRQUNBO0FBQUEsVUFDRSxNQUFNO0FBQUEsVUFDTixhQUFhLEtBQUssUUFBUSxrQ0FBVyxNQUFNO0FBQUEsUUFDN0M7QUFBQSxNQUNGO0FBQUEsTUFDQSxZQUFZO0FBQUEsUUFDVjtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQUFBLElBQ0EsUUFBUTtBQUFBLE1BQ04sTUFBTTtBQUFBLE1BQ04sT0FBTztBQUFBO0FBQUEsTUFFUDtBQUFBLElBQ0Y7QUFBQSxJQUNBLFFBQVE7QUFBQTtBQUFBLE1BRU4sZUFBZSxRQUFRO0FBQUEsSUFDekI7QUFBQSxFQUNGO0FBQ0YsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
