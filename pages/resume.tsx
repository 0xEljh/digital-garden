import { Box, Button, Container, Flex, Text, Link, VStack, Heading } from "@chakra-ui/react";
import { NavBar } from "@/components/common/nav";
import { LuDownload } from "react-icons/lu";
import type { ReactElement } from "react";
import type { NextPageWithLayout } from "./_app";

const ResumePage: NextPageWithLayout = () => {
  const handleDownloadPDF = () => {
    window.print();
  };

  return (
    <>
      {/* Navbar - hidden in print */}
      <Box className="no-print" mt={2}>
        <NavBar />
      </Box>
      {/* Download button - hidden in print */}
      <Box
        position="fixed"
        top="4"
        right="4"
        zIndex="1000"
        className="no-print"
      >
        <Button
          onClick={handleDownloadPDF}
          colorPalette="gray"
          variant="solid"
          size="lg"
        >
          <LuDownload />
          Download PDF
        </Button>
      </Box>

      {/* Resume Document */}
      <Container
        maxW="8.5in"
        bg="white"
        color="gray.900"
        p="0.45in"
        mx="auto"
        my={{ base: 0, md: 8 }}
        boxShadow={{ base: "none", md: "lg" }}
        className="resume-document"
        fontFamily="'Georgia', 'Garamond', serif"
        fontSize="11pt"
        lineHeight="1.3"
      >
        {/* Header */}
        <Box textAlign="center" mb="0.2in">
          <Heading
            as="h1"
            fontSize="20pt"
            fontWeight="600"
            letterSpacing="0.02em"
            mb="0.08in"
            fontFamily="inherit"
            color="gray.900"
          >
            Elijah Ng
          </Heading>
          <Text fontSize="10pt" color="gray.700">
            <Link href="mailto:elijah@0xeljh.com" color="gray.700" textDecoration="none">elijah@0xeljh.com</Link>
            <Text as="span" mx="0.15in" color="gray.500">·</Text>
            <Link href="https://github.com/0xEljh" color="gray.700" textDecoration="none">github.com/0xEljh</Link>
            <Text as="span" mx="0.15in" color="gray.500">·</Text>
            <Link href="https://0xeljh.com" color="gray.700" textDecoration="none">0xeljh.com</Link>
            <Text as="span" mx="0.15in" color="gray.500">·</Text>
            Singapore
          </Text>
        </Box>

        {/* Summary */}
        <ResumeSection title="Summary">
          <Text fontSize="10.5pt">
            Machine Learning / Systems Engineer with experience in training/inference optimisation, production data/LLM pipelines, and end-to-end products.
          </Text>
        </ResumeSection>

        {/* Skills */}
        <ResumeSection title="Skills">
          <VStack align="stretch" gap="0.05in">
            <SkillRow label="MLPerf" skills="Pytorch internals, Triton, CUDA (reading), torch.compile, quantisation, HuggingFace ecosystem" />
            <SkillRow label="ML & Deep Learning" skills="PyTorch, finetuning, LLM integration, RAG, wandb" />
            <SkillRow label="Data Engineering" skills="Prefect, Pandas, SQL, ETL pipelines, Pydantic" />
            <SkillRow label="Backend & Infrastructure" skills="FastAPI, PostgreSQL, Docker, Nix, asyncio, Cloudflare (cloud), GCP" />
            <SkillRow label="Frontend" skills="TypeScript, Next.js, motion, Drizzle, TanStack Query" />
          </VStack>
        </ResumeSection>

        {/* Experience */}
        <ResumeSection title="Experience">
          <ExperienceEntry
            title="Technical Cofounder"
            company="IBVC Inc. (Legal/Real Estate Tech)"
            date="2025–Present"
            bullets={[
              "Built ingestion + normalization Prefect flows aggregating 50+ delinquency/market sources into a unified data lake; processed 3k records/day with OpenTelemetry tracing and LLM-assisted error logging, driving 10x YoY growth in qualified leads.",
              "Shipped production LLM pipeline to extract structured data from unstructured legal PDFs, implementing schema validation, repair logic, and pipeline idempotence.",
              "Built a context-aware query-variant generator and results filter for skip-tracing. Improved contact hit-rate by 20x while capping cost to <$1/lead",
              // "Developed an autodialer app with AMD and text-to-speech voicemail drops"
            ]}
          />
          <ExperienceEntry
            title="Early Software Engineer"
            company="Pacts (Web3 Anti-Sybil)"
            date="2024"
            bullets={[
              "Owned Frontend Next.js app and Telegram bot for tracking on-chain activity and airdrop campaign management",
              "Implemented on-chain analytics and reward-simulation tooling to facilitate data-driven campaign design"
            ]}
          />
          <ExperienceEntry
            title="Technical Cofounder"
            company="MarinaChain (Web3 x Maritime Sustainability)"
            date="2022"
            bullets={[
              "Processed 1.3TB of raw telemetry data via Dusk to engineer features for a physics-informed maritime CO2 emissions model. Fused geospatial data with vessel specs to achieve explainable fuel and emissions estimates",
            ]}
          />
          <ExperienceEntry
            title="Machine Learning Engineer"
            company="MindPointEye (Founded by inventor of ELMs)"
            date="2021"
            bullets={[
              "Improved YOLOX-tiny model mAP from 0.60 to 0.85 through data augmentation (SimCLR), LR scheduling, HPO, and optimizer implementation tweaks*",
              "Developed quantization + compilation pipeline for YOLOX ONNX graphs to RKNN (Rockchip NPU)",
              "Initiated and led regional team on semi-supervised image labeling and dataset curation via latent space analysis (using fine-tuned GAN embeddings), saving hundreds of team hours per project"
            ]}
          />
        </ResumeSection>

        {/* Projects */}
        <ResumeSection title="Projects">
          <ProjectEntry
            title="Unsloth Challenge"
            date="2025"
            subtitle="MLPerf Puzzles"
            bullets={[
              // "Solved Unsloth's MLPerf challenges",
              "Wrote a custom Triton kernel for NF4 dequantization that's 25% faster than Unsloth's",
              "Enabled QLoRA fine-tuning with FSDP2 and torch compile",
              "Implemented a cut-cross-entropy-inspired memory efficient backprop that works in GRPO"
            ]}
          />
          <ProjectEntry
            title="vamptutor.com"
            subtitle="Vector-based card search for MTG"
            date="2025"
            bullets={[
              "Built a natural-language search for Magic: The Gathering cards using a fine-tuned qwen-embedding model"
            ]}
          />
          <ProjectEntry
            title="ETH Tokyo 2023"
            subtitle="Winner: Best Dashboard (3K USD prize)"
            bullets={[
              "Doubled down on analysis over visuals: shipped a functional Jupyter Notebook with aggregated analytics for 1inch Fusion resolver on-chain activity, execution profits, and gas spend"
            ]}
          />
          <ProjectEntry
            title="Liquid Crypto Index Fund"
            subtitle="Empire Group"
            date="2023"
            bullets={[
              "Curated a dataset of 2,000+ tokens from 2013–2023; developed backtests for systematic index fund strategies with simulated execution conditions (slippage; modelled from market data)"
            ]}
          />
          <ProjectEntry
            title="Dreambooth Optimization"
            date="2023"
            bullets={[
              "Reduced peak VRAM by 50% for Stable Diffusion fine-tuning through quantization and attention chunking. Turned client profitable by fitting training on 3080 instances."
            ]}
          />
          <Box mb="0.12in">
            <Text fontWeight="600" fontSize="11pt">Open Source</Text>
            <Box as="ul" ml="0.15in" mt="0.03in" fontSize="10.5pt">
              <Box as="li" mb="0.02in">Contributed a bug fixes to PyTorch Lightning and bt (backtrader)</Box>
              <Box as="li" mb="0.02in">*Classic SGD: Reverted PyTorch SGD to original Sutskever formula for separable LR/momentum behavior</Box>
            </Box>
          </Box>
        </ResumeSection>

        {/* Education */}
        <ResumeSection title="Education">
          <Flex justify="space-between" align="baseline">
            <Box>
              <Text as="span" fontWeight="600" fontSize="11pt">National University of Singapore</Text>
            </Box>
            <Text fontSize="10pt" color="gray.600" whiteSpace="nowrap">2017–2021</Text>
          </Flex>
          <Text fontSize="10.5pt" mt="0.03in">
            BEng, Engineering Science. Minor in Computer Science.
          </Text>
          <Text fontSize="10.5pt">
            Specializations: Computational Engineering, Biomedical Engineering
          </Text>
          <Text fontSize="10.5pt">
            A- median | 5 postgraduate modules | FYP: Self-organizing Neural Networks
          </Text>
          <Text fontSize="10.5pt" mt="0.03in">
            Interned at A*STAR (post-quantum crypto for deep learning) and DSO (opto-acoustic FEM solver)
          </Text>
        </ResumeSection>
      </Container>

      {/* Print styles */}
      <style jsx global>{`
        @media print {
          .no-print {
            display: none !important;
          }
          
          body {
            background: white !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          
          .resume-document {
            box-shadow: none !important;
            margin: 0 !important;
            padding: 0 !important;
            max-width: none !important;
          }
          
          @page {
            size: letter;
            margin: 0.5in;
          }
          
          a {
            text-decoration: none !important;
          }
        }
      `}</style>
    </>
  );
};

// Custom layout to remove default site layout for clean print
ResumePage.getLayout = function getLayout(page: ReactElement) {
  return page;
};

export default ResumePage;

// Helper Components

function ResumeSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Box as="section" mb="0.18in">
      <Heading
        as="h2"
        fontSize="11pt"
        fontWeight="600"
        textTransform="uppercase"
        letterSpacing="0.08em"
        borderBottom="1px solid"
        borderColor="gray.900"
        pb="0.04in"
        mb="0.08in"
        fontFamily="inherit"
        color="gray.900"
      >
        {title}
      </Heading>
      {children}
    </Box>
  );
}

function SkillRow({ label, skills }: { label: string; skills: string }) {
  return (
    <Text fontSize="10.5pt">
      <Text as="span" fontWeight="600">{label}:</Text> {skills}
    </Text>
  );
}

function ExperienceEntry({
  title,
  company,
  date,
  bullets,
}: {
  title: string;
  company: string;
  date: string;
  bullets: string[];
}) {
  return (
    <Box mb="0.12in">
      <Flex justify="space-between" align="baseline" mb="0.03in">
        <Box>
          <Text as="span" fontWeight="600" fontSize="11pt">{title}</Text>
          <Text as="span" fontStyle="italic" color="gray.700"> — {company}</Text>
        </Box>
        <Text fontSize="10pt" color="gray.600" whiteSpace="nowrap">{date}</Text>
      </Flex>
      <Box as="ul" ml="0.15in" mt="0.03in" fontSize="10.5pt">
        {bullets.map((bullet, i) => (
          <Box as="li" key={i} mb="0.02in">{bullet}</Box>
        ))}
      </Box>
    </Box>
  );
}

function ProjectEntry({
  title,
  subtitle,
  date,
  bullets,
}: {
  title: string;
  subtitle?: string;
  date?: string;
  bullets: string[];
}) {
  return (
    <Box mb="0.12in">
      <Flex justify="space-between" align="baseline" mb="0.03in">
        <Box>
          <Text as="span" fontWeight="600" fontSize="11pt">{title}</Text>
          {subtitle && <Text as="span" fontStyle="italic" color="gray.700"> — {subtitle}</Text>}
        </Box>
        {date && <Text fontSize="10pt" color="gray.600" whiteSpace="nowrap">{date}</Text>}
      </Flex>
      <Box as="ul" ml="0.15in" mt="0.03in" fontSize="10.5pt">
        {bullets.map((bullet, i) => (
          <Box as="li" key={i} mb="0.02in">{bullet}</Box>
        ))}
      </Box>
    </Box>
  );
}
